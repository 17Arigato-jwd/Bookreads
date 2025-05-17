document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("bookModal");
    const btn = document.getElementById("addBookBtn");
    const span = document.getElementsByClassName("close")[0];
    const bookGrid = document.getElementById('bookGrid');
    let editingBookIndex = null; // Store index when editing

    // Display Modal
    btn.onclick = function() {
        modal.style.display = "block";
        clearForm(); // Clear form when adding a new book
    }

    // Close Modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close Modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    // Handle Book Form Submission
    document.getElementById('bookForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form reload

        const bookData = {
            name: document.getElementById('bookName').value,
            website: document.getElementById('websiteName').value,
            url: document.getElementById('bookURL').value,
            image: document.getElementById('bookImageURL').value, // Use image URL directly
            list: document.getElementById('bookList').value,
            chapter: document.getElementById('chapter').value || '0',
            liked: false
        };

        if (editingBookIndex !== null) {
            saveBookToLocalStorageAtIndex(bookData, editingBookIndex);
        } else {
            saveBookToLocalStorage(bookData);
        }

        displayBooks(); // Refresh the display
        updateStorageProgress(); // <-- Add this line
        document.getElementById("bookModal").style.display = "none"; // Close modal
    });


    // Function to preview the selected image
    function previewImageURL(event) {
        const url = event.target.value;
        const preview = document.getElementById('imagePreview');

        if (url) {
            preview.src = url;
            preview.style.display = 'block';
        } else {
            preview.src = '';
            preview.style.display = 'none';
        }
    }


    // Save book to localStorage
    function saveBookToLocalStorage(book) {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        books.push(book);
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Display books on page load
    function displayBooks() {
        bookGrid.innerHTML = ''; // Clear existing content
        const books = JSON.parse(localStorage.getItem('books')) || [];

        books.forEach((book, index) => {
            addBookToGrid(book, index);
        });
    }

    // Add Book to Grid
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

        // Like Button Functionality
        bookItem.querySelector('.like-btn').addEventListener('click', function() {
            book.liked = !book.liked;
            this.classList.toggle('liked');
            this.style.color = book.liked ? 'pink' : 'white'; // Change color
            saveBookToLocalStorageAtIndex(book, index); // Save the like status
        });

        // Edit Button Functionality
        bookItem.querySelector('.edit-btn').addEventListener('click', function() {
            loadBookIntoForm(book, index);
            modal.style.display = "block"; // Open modal to edit
        });

        // Delete Button Functionality
        bookItem.querySelector('.delete-btn').addEventListener('click', function() {
            if (confirm("Are you sure you want to delete this book?")) {
                deleteBookFromLocalStorage(index);
                displayBooks();
                updateStorageProgress(); // <-- Add this line
            }
        });

        // Chapter Change Functionality
        bookItem.querySelector('.chapter-input').addEventListener('change', function() {
            book.chapter = this.value;
            saveBookToLocalStorageAtIndex(book, index);
        });

        bookGrid.appendChild(bookItem);
    }

    // Save an edited book to localStorage at a specific index
    function saveBookToLocalStorageAtIndex(book, index) {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        books[index] = book;
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Delete book from localStorage
    function deleteBookFromLocalStorage(index) {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        books.splice(index, 1);
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Load book data into form for editing
    function loadBookIntoForm(book, index) {
        document.getElementById('bookName').value = book.name;
        document.getElementById('websiteName').value = book.website;
        document.getElementById('bookURL').value = book.url;
        document.getElementById('bookList').value = book.list;
        document.getElementById('chapter').value = book.chapter;
        editingBookIndex = index; // Track the index being edited
    }

    // Clear form fields
    function clearForm() {
        document.getElementById('bookForm').reset();
        editingBookIndex = null; // Reset editing state
    }






    function reorderBooks(newOrder) {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const reorderedBooks = newOrder.map(i => books[i]);
    localStorage.setItem('books', JSON.stringify(reorderedBooks));
    displayBooks();
    updateStorageProgress();
}



    function updateStorageProgress() {
        const maxStorage = 5 * 1024 * 1024; // 5MB in bytes

        const books = JSON.parse(localStorage.getItem('books')) || [];
        const currentCount = books.length;

        // Calculate used bytes by serializing books data only
        const booksString = JSON.stringify(books);
        const usedBytes = booksString ? booksString.length * 2 : 0; // UTF-16: ~2 bytes per char

        // Calculate average book size (avoid division by zero)
        const averageBookSize = currentCount > 0 ? usedBytes / currentCount : 700;

        // Estimate max books with this average size
        const estimatedMaxBooks = Math.floor(maxStorage / averageBookSize);

        // Calculate percent used based on books data size
        const percent = Math.min((usedBytes / maxStorage) * 100, 100).toFixed(1);

        // Update progress bar width
        const bar = document.getElementById('storageBar');
        bar.style.width = `${percent}%`;

        // Update text content with dynamic counts
        const text = document.getElementById('storageText');
        text.textContent = `${currentCount} / ${estimatedMaxBooks} books (${percent}%)`;
    }



    // -------------------------------
    //  REPLACE YOUR EXISTING load-handler
    // -------------------------------
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
});
