const books = [];
const RENDER_EVENT = 'render-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';
let deletedId = null;

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;
  const modalDeleteButton = document.getElementById('modalDeleteButton');

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${year}`;

  const action = document.createElement('div');
  action.classList.add('action');

  const bookDesc = document.createElement('div');
  bookDesc.classList.add('book_desc');
  bookDesc.append(textTitle, textAuthor, textYear);

  const bookItem = document.createElement('article');
  bookItem.classList.add('book_item');
  bookItem.append(bookDesc, action);
  bookItem.setAttribute('id', `book-${id}`);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('trash-button');
  deleteButton.addEventListener('click', function (event) {
    myModal.style.display = 'block';
    deletedId = id;
  });

  action.append(deleteButton);

  if (isComplete) {
    const uncheckButton = document.createElement('button');
    uncheckButton.classList.add('uncompleted-button');

    uncheckButton.addEventListener('click', function () {
      undoBookFromComplete(id);
    });

    action.insertBefore(uncheckButton, deleteButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('completed-button');

    checkButton.addEventListener('click', function () {
      addBookToComplete(id);
    });

    action.insertBefore(checkButton, deleteButton);
  }

  return bookItem;
}

function addBook() {
  const textBookTitle = document.getElementById('inputBookTitle').value;
  const textBookAuthor = document.getElementById('inputBookAuthor').value;
  const textBookYear = document.getElementById('inputBookYear').value;
  const bookIsComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textBookTitle,
    textBookAuthor,
    textBookYear,
    bookIsComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function renderBookShelf(bookList) {
  const uncompleteBookShelf = document.getElementById(
    'incompleteBookshelfList'
  );

  const completeBookShelf = document.getElementById('completeBookshelfList');

  uncompleteBookShelf.innerHTML = '';
  completeBookShelf.innerHTML = '';

  for (const bookItem of bookList) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookShelf.append(bookElement);
    } else {
      uncompleteBookShelf.append(bookElement);
    }
  }
}

function filterBookShelfByTitle(bookList, title) {
  let result = bookList;
  if (title) {
    result = bookList.filter(function (book) {
      return book.title.toLowerCase().includes(title.toLowerCase());
    });
  }

  return result;
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  const searchForm = document.getElementById('searchBook');
  const textSearchTitle = document.getElementById('searchBookTitle');
  const completeCheckBox = document.getElementById('inputBookIsComplete');

  const myModal = document.getElementById('myModal');
  const modalClose = document.getElementById('modalCloseButton');
  const modalCancelButton = document.getElementById('modalCancelButton');
  const modalDeleteButton = document.getElementById('modalDeleteButton');

  modalCancelButton.addEventListener('click', function () {
    myModal.style.display = 'none';
    deletedId = null;
  });
  modalClose.addEventListener('click', function () {
    myModal.style.display = 'none';
    deletedId = null;
  });
  modalDeleteButton.addEventListener('click', function () {
    removeBook(deletedId);
    myModal.style.display = 'none';
    deletedId = null;
  });

  window.addEventListener('click', function (event) {
    if (event.target == myModal) {
      myModal.style.display = 'none';
      deletedId = null;
    }
  });

  completeCheckBox.addEventListener('change', function (event) {
    const bookButtonSubmit = document.getElementById('bookSubmit');
    if (event.target.checked) {
      bookButtonSubmit.innerHTML =
        'Masukkan Buku ke rak <span>Buku-ku Sudah Dibaca</span>';
    } else {
      bookButtonSubmit.innerHTML =
        'Masukkan Buku ke rak <span>Buku-ku Belum Dibaca</span>';
    }
  });

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const bookFiltered = filterBookShelfByTitle(books, textSearchTitle.value);
    renderBookShelf(bookFiltered);
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  renderBookShelf(books);
});
