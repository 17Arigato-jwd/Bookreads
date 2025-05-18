document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("bookModal");
    const btn = document.getElementById("addBookBtn");
    const span = document.getElementsByClassName("close")[0];
    const bookGrid = document.getElementById('bookGrid');
    const bookListInput = document.getElementById('bookListInput');
    const listDropdown = document.getElementById('listDropdown');
    const createListBtn = document.getElementById('createListBtn');
    let selectedLists = [];
    let editingBookIndex = null;
    let bookLists = JSON.parse(localStorage.getItem("bookLists")) || ["favorites", "reading", "completed"];

    const buttons = document.querySelectorAll('.colorful-button, .orange-button');

    buttons.forEach((btn) => {
      let isPressed = false;

      btn.addEventListener('click', () => {
        btn.style.transition = 'transform 150ms cubic-bezier(0.4, 0, 1, 1)';
        btn.style.transform = 'scale(0.93) translateY(3px)';

        setTimeout(() => {
          btn.style.transition = 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1)';
          btn.style.transform = 'scale(1.03) translateY(-1px)';
        }, 200);

        setTimeout(() => {
          if (btn.classList.contains('colorful-button')) {
            isPressed = !isPressed;
            const allBooks = document.querySelectorAll('.book-item');
            if (isPressed) {
              btn.classList.add('pressed');
              btn.style.transition = 'transform 200ms ease';
              btn.style.transform = 'scale(0.97) translateY(2px)';
              allBooks.forEach(book => book.classList.add('wobble'));
            } else {
              btn.classList.remove('pressed');
              btn.style.transition = 'transform 200ms ease';
              btn.style.transform = 'scale(1) translateY(0)';
              allBooks.forEach(book => book.classList.remove('wobble'));
            }
          } else {
            btn.style.transition = 'transform 200ms ease';
            btn.style.transform = 'scale(1) translateY(0)';
          }
        }, 500);
      });
    });

    btn.onclick = function () {
      modal.style.display = "block";
      clearForm();
    }

    span.onclick = function () {
      modal.style.display = "none";
    }

    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }

    document.getElementById('bookForm').addEventListener('submit', function (event) {
      event.preventDefault();

      if (selectedLists.length === 0) {
        alert("Please select at least one list.");
        return;
      }

      const bookData = {
        name: document.getElementById('bookName').value,
        website: document.getElementById('websiteName').value,
        url: document.getElementById('bookURL').value,
        image: document.getElementById('bookImageURL').value,
        lists: [...selectedLists],
        chapter: document.getElementById('chapter').value || '0',
        liked: false
      };

      if (editingBookIndex !== null) {
        saveBookToLocalStorageAtIndex(bookData, editingBookIndex);
      } else {
        saveBookToLocalStorage(bookData);
      }

      displayBooks();
      updateStorageProgress();
      modal.style.display = "none";
    });

    function previewImageURL(event) {
      const url = event.target.value;
      const preview = document.getElementById('imagePreview');
      preview.src = url || '';
      preview.style.display = url ? 'block' : 'none';
    }

    function saveBookToLocalStorage(book) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
      books.push(book);
      localStorage.setItem('books', JSON.stringify(books));
    }

    function displayBooks() {
      bookGrid.innerHTML = '';
      let books = JSON.parse(localStorage.getItem('books')) || [];

      books = books.map(book => {
        if (!book.lists && book.list) {
          book.lists = [book.list];
          delete book.list;
        }
        return book;
      });

      localStorage.setItem('books', JSON.stringify(books));
      books.forEach((book, index) => addBookToGrid(book, index));

      const editLayoutBtn = document.querySelector('.colorful-button');
      if (editLayoutBtn?.classList.contains('pressed')) {
        document.querySelectorAll('.book-item').forEach(book => book.classList.add('wobble'));
      }
    }

    function addBookToGrid(book, index) {
      const bookItem = document.createElement('div');
      bookItem.classList.add('book-item');
      bookItem.setAttribute('data-index', index);

      bookItem.innerHTML = `
        <a href="${book.url}" target="_blank">
            <img src="${book.image}" alt="Book Thumbnail" class="book-thumbnail">
        </a>
          <h3 class="book-name">${book.name}</h3>
          <p class="website-name">${book.website}</p>
          <div class="book-controls">
              <button class="like-btn ${book.liked ? 'liked' : ''}"><i class="fa fa-heart"></i></button>
              <button class="edit-btn"><i class="fa fa-edit"></i></button>
              <button class="delete-btn"><i class="fa fa-trash"></i></button>
          </div>
          <div class="chapter-indicator">
              <label for="chapter">CH</label>
              <input type="number" value="${book.chapter}" min="0" step="1" class="chapter-input">
          </div>
      `;

      bookItem.querySelector('.like-btn').addEventListener('click', function () {
        book.liked = !book.liked;
        this.classList.toggle('liked');
        this.style.color = book.liked ? 'pink' : 'white';
        saveBookToLocalStorageAtIndex(book, index);
      });

      bookItem.querySelector('.edit-btn').addEventListener('click', function () {
        loadBookIntoForm(book, index);
        modal.style.display = "block";
      });

      bookItem.querySelector('.delete-btn').addEventListener('click', function () {
        if (confirm("Are you sure you want to delete this book?")) {
          deleteBookFromLocalStorage(index);
          displayBooks();
          updateStorageProgress();
        }
      });

      bookItem.querySelector('.chapter-input').addEventListener('change', function () {
        book.chapter = this.value;
        saveBookToLocalStorageAtIndex(book, index);
      });

      bookGrid.appendChild(bookItem);
    }

    function saveBookToLocalStorageAtIndex(book, index) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
      books[index] = book;
      localStorage.setItem('books', JSON.stringify(books));
    }

    function deleteBookFromLocalStorage(index) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
      books.splice(index, 1);
      localStorage.setItem('books', JSON.stringify(books));
    }

    function loadBookIntoForm(book, index) {
      document.getElementById('bookName').value = book.name;
      document.getElementById('websiteName').value = book.website;
      document.getElementById('bookURL').value = book.url;
      document.getElementById('bookImageURL').value = book.image;
      selectedLists = [...(book.lists || [])];
      renderSelectedLists();
      bookListInput.dispatchEvent(new Event('input'));
      document.getElementById('chapter').value = book.chapter;
      editingBookIndex = index;
    }

    function clearForm() {
      document.getElementById('bookForm').reset();
      selectedLists = [];
      renderSelectedLists();
      editingBookIndex = null;
    }

    function reorderBooks(newOrder) {
      const books = JSON.parse(localStorage.getItem('books')) || [];
      const reorderedBooks = newOrder.map(i => books[i]);
      localStorage.setItem('books', JSON.stringify(reorderedBooks));
      displayBooks();
      updateStorageProgress();
    }

    function updateStorageProgress() {
      const maxStorage = 5 * 1024 * 1024;
      const books = JSON.parse(localStorage.getItem('books')) || [];
      const booksString = JSON.stringify(books);
      const usedBytes = booksString ? booksString.length * 2 : 0;
      const averageBookSize = books.length > 0 ? usedBytes / books.length : 700;
      const estimatedMaxBooks = Math.floor(maxStorage / averageBookSize);
      const percent = Math.min((usedBytes / maxStorage) * 100, 100).toFixed(1);

      document.getElementById('storageBar').style.width = `${percent}%`;
      document.getElementById('storageText').textContent = `${books.length} / ${estimatedMaxBooks} books (${percent}%)`;
    }

    window.addEventListener('load', () => {
      displayBooks();
      updateStorageProgress();
      // Disable on mobile devices
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return;
    }
      const grid = document.getElementById('bookGrid');

      /* --------------------------------
         shared state
      -------------------------------- */
      let clone        = null;          // the floating copy that follows the mouse
      let placeholder  = null;          // invisible div that marks the gap
      let draggedEl    = null;          // real book being moved
      let draggedIndex = null;

      let lastX = 0,  lastY = 0;
      let curX  = 0,  curY  = 0;
      let tgtX  = 0,  tgtY  = 0;
      let rafId = null;
      let startTime = 0;
      const ease = 0.12;

      /* --------------------------------
         cancel native image/anchor dragging
      -------------------------------- */
      grid.addEventListener('dragstart', e => e.preventDefault());

      /* --------------------------------
         start drag  (mousedown on a book)
      -------------------------------- */
      grid.addEventListener('mousedown', e => {
        const editLayoutBtn = document.querySelector('.colorful-button');
        if (!editLayoutBtn.classList.contains('pressed')) {
          return; // Don't allow dragging unless Edit Layout is active
        }

        const book = e.target.closest('.book-item');
        if (!book) return;

        e.preventDefault();                            // kill native drag
        draggedEl    = book;
        draggedIndex = [...grid.children].indexOf(book);

        // placeholder -- keeps layout gap
        const rect = book.getBoundingClientRect();
        placeholder = document.createElement('div');
        placeholder.className = 'book-placeholder';
        placeholder.style.width  = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.border = '2px dashed rgba(255,255,255,0.35)';
        placeholder.style.borderRadius = getComputedStyle(book).borderRadius;
        placeholder.style.boxSizing = 'border-box';

        grid.insertBefore(placeholder, book);          // put gap where book was
        grid.removeChild(book);                        // take book out of flow

        // animated clone
        clone = book.cloneNode(true);
        clone.classList.add('clone');
        Object.assign(clone.style, {
          width : `${rect.width}px`,
          height: `${rect.height}px`,
          left  : `${rect.left + rect.width  / 2}px`,
          top   : `${rect.top  + rect.height / 2}px`
        });
        document.body.appendChild(clone);

        tgtX = curX = lastX = rect.left + rect.width  / 2;
        tgtY = curY = lastY = rect.top  + rect.height / 2;
        startTime = performance.now();

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
        rafId = requestAnimationFrame(loop);
      });

      /* --------------------------------
   mousemove -- update cursor + placeholder
-------------------------------- */
function onMove(ev) {
  tgtX = ev.clientX;
  tgtY = ev.clientY;
  movePlaceholder(ev.clientX, ev.clientY);
}

function movePlaceholder(cursorX, cursorY) {
  const items = Array.from(grid.children).filter(el => el !== placeholder);
  const rows = [];

  // Group items into rows based on vertical proximity
  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const rowY = rect.top;
    let matchedRow = rows.find(row => Math.abs(row.y - rowY) < 10);

    if (!matchedRow) {
      matchedRow = { y: rowY, items: [] };
      rows.push(matchedRow);
    }

    matchedRow.items.push({ el: item, rect });
  }

  // Find the closest row to the cursor's Y
  rows.sort((a, b) => Math.abs(a.y - cursorY) - Math.abs(b.y - cursorY));
  const targetRow = rows[0];
  if (!targetRow) return;

  // Find where in the row the cursor falls
  for (const { el, rect } of targetRow.items) {
    if (cursorX < rect.left + rect.width / 2) {
      if (placeholder !== el.previousSibling) {
        grid.insertBefore(placeholder, el);
      }
      return;
    }
  }

  // If cursor is past the end of the row, move to end of last item
  const last = targetRow.items[targetRow.items.length - 1]?.el;
  if (last && placeholder !== last.nextSibling) {
    grid.insertBefore(placeholder, last.nextSibling);
  }
}


      /* --------------------------------
         finish drag  (mouseup)
      -------------------------------- */
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        cancelAnimationFrame(rafId);

        /* fade-out clone */
        if (clone) {
          clone.style.transition = 'transform 200ms ease, opacity 200ms ease';
          clone.style.transform  = 'translate(-50%, -50%) scale(0.9)';
          clone.style.opacity    = '0';
          setTimeout(() => clone?.remove(), 200);
          clone = null;
        }

        /* insert real book at placeholder position */
        if (placeholder) {
          grid.insertBefore(draggedEl, placeholder);
          placeholder.remove();
          placeholder = null;
        }

        /* build new order and persist */
        const newOrder = [];
        grid.querySelectorAll('.book-item').forEach(el => {
          newOrder.push(parseInt(el.dataset.index, 10));
        });
        reorderBooks(newOrder);          // updates localStorage + redraws grid

        draggedEl = null;                // cleanup
      }

      /* --------------------------------
         animation loop for clone wobble / lag
      -------------------------------- */
      function loop(ts) {
        curX += (tgtX - curX) * ease;
        curY += (tgtY - curY) * ease;

        const dx = curX - lastX;
        lastX = curX;
        lastY = curY;

        const tilt   = Math.max(Math.min(dx * 0.4, 15), -15);
        const wobble = 5 * Math.sin((ts - startTime) / 120);

        if (clone) {
          clone.style.left = `${curX}px`;
          clone.style.top  = `${curY}px`;
          clone.style.transform =
            `translate(-50%, -50%) rotate(${tilt + wobble}deg) scale(1.1)`;
        }
        rafId = requestAnimationFrame(loop);
      }
    });
    window.addEventListener('load', () => {
       displayBooks();
       updateStorageProgress();

       if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

       const grid = document.getElementById('bookGrid');
       let clone = null, placeholder = null, draggedEl = null, draggedIndex = null;
       let lastX = 0, lastY = 0, curX = 0, curY = 0, tgtX = 0, tgtY = 0;
       let rafId = null, startTime = 0;
       const ease = 0.12;

       grid.addEventListener('dragstart', e => e.preventDefault());

       grid.addEventListener('mousedown', e => {
         const editLayoutBtn = document.querySelector('.colorful-button');
         if (!editLayoutBtn.classList.contains('pressed')) return;

         const book = e.target.closest('.book-item');
         if (!book) return;

         e.preventDefault();
         draggedEl = book;
         draggedIndex = [...grid.children].indexOf(book);

         const rect = book.getBoundingClientRect();
         placeholder = document.createElement('div');
         placeholder.className = 'book-placeholder';
         Object.assign(placeholder.style, {
           width: `${rect.width}px`,
           height: `${rect.height}px`,
           border: '2px dashed rgba(255,255,255,0.35)',
           borderRadius: getComputedStyle(book).borderRadius,
           boxSizing: 'border-box'
         });
         grid.insertBefore(placeholder, book);
         grid.removeChild(book);

         clone = book.cloneNode(true);
         clone.classList.add('clone');
         Object.assign(clone.style, {
           width: `${rect.width}px`,
           height: `${rect.height}px`,
           left: `${rect.left + rect.width / 2}px`,
           top: `${rect.top + rect.height / 2}px`
         });
         document.body.appendChild(clone);

         tgtX = curX = lastX = rect.left + rect.width / 2;
         tgtY = curY = lastY = rect.top + rect.height / 2;
         startTime = performance.now();

         document.addEventListener('mousemove', onMove);
         document.addEventListener('mouseup', onUp);
         rafId = requestAnimationFrame(loop);
       });

       function onMove(ev) {
         tgtX = ev.clientX;
         tgtY = ev.clientY;
         movePlaceholder(ev.clientX, ev.clientY);
       }

       function movePlaceholder(cursorX, cursorY) {
         const items = Array.from(grid.children).filter(el => el !== placeholder);
         const rows = [];

         for (const item of items) {
           const rect = item.getBoundingClientRect();
           const rowY = rect.top;
           let matchedRow = rows.find(row => Math.abs(row.y - rowY) < 10);
           if (!matchedRow) {
             matchedRow = { y: rowY, items: [] };
             rows.push(matchedRow);
           }
           matchedRow.items.push({ el: item, rect });
         }

         rows.sort((a, b) => Math.abs(a.y - cursorY) - Math.abs(b.y - cursorY));
         const targetRow = rows[0];
         if (!targetRow) return;

         for (const { el, rect } of targetRow.items) {
           if (cursorX < rect.left + rect.width / 2) {
             if (placeholder !== el.previousSibling) grid.insertBefore(placeholder, el);
             return;
           }
         }

         const last = targetRow.items[targetRow.items.length - 1]?.el;
         if (last && placeholder !== last.nextSibling) grid.insertBefore(placeholder, last.nextSibling);
       }

       function onUp() {
         document.removeEventListener('mousemove', onMove);
         document.removeEventListener('mouseup', onUp);
         cancelAnimationFrame(rafId);

         if (clone) {
           clone.style.transition = 'transform 200ms ease, opacity 200ms ease';
           clone.style.transform = 'translate(-50%, -50%) scale(0.9)';
           clone.style.opacity = '0';
           setTimeout(() => clone?.remove(), 200);
           clone = null;
         }

         if (placeholder) {
           grid.insertBefore(draggedEl, placeholder);
           placeholder.remove();
           placeholder = null;
         }

         const newOrder = [];
         grid.querySelectorAll('.book-item').forEach(el => newOrder.push(parseInt(el.dataset.index, 10)));
         reorderBooks(newOrder);

         draggedEl = null;
       }

       function loop(ts) {
         curX += (tgtX - curX) * ease;
         curY += (tgtY - curY) * ease;

         const dx = curX - lastX;
         lastX = curX;
         lastY = curY;

         const tilt = Math.max(Math.min(dx * 0.4, 15), -15);
         const wobble = 5 * Math.sin((ts - startTime) / 120);

         if (clone) {
           clone.style.left = `${curX}px`;
           clone.style.top = `${curY}px`;
           clone.style.transform = `translate(-50%, -50%) rotate(${tilt + wobble}deg) scale(1.1)`;
         }
         rafId = requestAnimationFrame(loop);
       }
     });

    bookListInput.addEventListener('input', () => {
      const value = bookListInput.value.trim().toLowerCase();
      listDropdown.innerHTML = '';
      if (value === '') {
        listDropdown.classList.add('hidden');
        createListBtn.classList.add('hidden');
        return;
      }

      const matches = bookLists.filter(list => list.toLowerCase().includes(value));
      const alreadyExists = matches.some(list => list.toLowerCase() === value);

      matches.forEach(match => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selectedLists.includes(match);
        checkbox.addEventListener('change', () => toggleListSelection(match));
        div.appendChild(checkbox);
        div.appendChild(document.createTextNode(match));
        listDropdown.appendChild(div);
      });

      listDropdown.classList.remove('hidden');
      createListBtn.classList.toggle('hidden', alreadyExists);
    });

    createListBtn.addEventListener('click', () => {
      const newList = bookListInput.value.trim();
      if (newList && !bookLists.includes(newList)) {
        bookLists.push(newList);
        localStorage.setItem("bookLists", JSON.stringify(bookLists));
        toggleListSelection(newList);
        bookListInput.value = '';
        listDropdown.classList.add('hidden');
        createListBtn.classList.add('hidden');
      }
    });

    function toggleListSelection(listName) {
      const index = selectedLists.indexOf(listName);
      if (index === -1) {
        selectedLists.push(listName);
      } else {
        selectedLists.splice(index, 1);
      }
      renderSelectedLists();
    }

    function renderSelectedLists() {
      const container = document.getElementById('selectedLists');
      container.innerHTML = '';
      selectedLists.forEach(list => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = list;
        container.appendChild(tag);
      });
    }

    // Ensure displayBooks is available on window load
    window.addEventListener('load', () => {
      displayBooks();
      updateStorageProgress();
    });
});
