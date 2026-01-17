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
      setTimeout(() => modal.classList.add('show'), 10);
      clearForm();
    }

    // Track mouse position for ripple effect
    buttons.forEach((button) => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            button.style.setProperty('--mouse-x', `${x}%`);
            button.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    span.onclick = function () {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = "none", 250);
    }

    window.onclick = function (event) {
      if (event.target === modal) {
          modal.classList.remove('show');
          setTimeout(() => modal.style.display = "none", 250);
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
            website: document.getElementById('websiteName').value || '',  // Optional
            url: document.getElementById('bookURL').value || '',           // Optional
            image: document.getElementById('bookImageURL').value,
            lists: [...selectedLists],
            chapter: document.getElementById('chapter').value || '0',      // Optional, default to 0
            liked: false
        };

        if (editingBookIndex !== null) {
            saveBookToLocalStorageAtIndex(bookData, editingBookIndex);
        } else {
            saveBookToLocalStorage(bookData);
        }

        displayBooks();
        updateStorageProgress();
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = "none", 250);
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

      bookItem.querySelector('.like-btn').addEventListener('click', function (e) {
        book.liked = !book.liked;
        this.classList.toggle('liked');
        if (book.liked) {
           // Create heart explosion
         createHeartExplosion(e.clientX, e.clientY);
         this.style.color = '#ff1744';
        } else {
        this.style.color = 'white';
      }
    
    saveBookToLocalStorageAtIndex(book, index);
      });

      bookItem.querySelector('.edit-btn').addEventListener('click', function () {
        loadBookIntoForm(book, index);
        modal.style.display = "block";
        setTimeout(() => modal.classList.add('show'), 10);  // ADD THIS LINE
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
        document.getElementById('websiteName').value = book.website || '';
        document.getElementById('bookURL').value = book.url || '';
        document.getElementById('bookImageURL').value = book.image || '';
        
        // Show image preview if exists
        if (book.image) {
            imagePreview.src = book.image;
            imagePreview.classList.add('show');
            imageDropZone.classList.add('has-image');
        }
        
        // Show optional fields if any are filled
        if (book.website || book.url || (book.chapter && book.chapter !== '0')) {
            document.getElementById('optionalFields').classList.add('show');
            document.getElementById('toggleOptional').classList.add('active');
        }
        
        selectedLists = [...(book.lists || [])];
        renderSelectedLists();
        bookListInput.dispatchEvent(new Event('input'));
        document.getElementById('chapter').value = book.chapter || '';
        editingBookIndex = index;
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Book';
    }

    function clearForm() {
        document.getElementById('bookForm').reset();
        selectedLists = [];
        renderSelectedLists();
        editingBookIndex = null;
        
        // Reset optional fields section
        document.getElementById('optionalFields').classList.remove('show');
        document.getElementById('toggleOptional').classList.remove('active');
        
        // Reset image preview
        imagePreview.classList.remove('show');
        imageDropZone.classList.remove('has-image');
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Add New Book';
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

// Remove all three separate window.addEventListener('load') calls and replace with this single one:

window.addEventListener('load', () => {
    displayBooks();
    updateStorageProgress();
    
    // Drag and drop only on desktop
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return;
    }
    
    const grid = document.getElementById('bookGrid');
    let clone = null, placeholder = null, draggedEl = null, draggedIndex = null;
    let lastX = 0, lastY = 0, curX = 0, curY = 0, tgtX = 0, tgtY = 0;
    let rafId = null, startTime = 0;
    const ease = 0.08;

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
            borderRadius: getComputedStyle(book).borderRadius,
            boxSizing: 'border-box'
        });
        
        grid.insertBefore(placeholder, book);
        grid.removeChild(book);

        // animated clone
        clone = book.cloneNode(true);
        clone.classList.add('clone');
        clone.classList.remove('wobble'); // Remove wobble from clone
        Object.assign(clone.style, {
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            left: `${rect.left + rect.width / 2}px`,
            top: `${rect.top + rect.height / 2}px`,
            transition: 'none' // Remove transition for smooth manual animation
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
                if (placeholder !== el.previousSibling) {
                    grid.insertBefore(placeholder, el);
                }
                return;
            }
        }

        const last = targetRow.items[targetRow.items.length - 1]?.el;
        if (last && placeholder !== last.nextSibling) {
            grid.insertBefore(placeholder, last.nextSibling);
        }
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
        grid.querySelectorAll('.book-item').forEach(el => {
            newOrder.push(parseInt(el.dataset.index, 10));
        });
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
        
        const text = document.createElement('span');
        text.textContent = list;
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '×';
        removeBtn.className = 'tag-remove';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            toggleListSelection(list);
        };
        
        tag.appendChild(text);
        tag.appendChild(removeBtn);
        container.appendChild(tag);
    });
}


// Toggle optional fields
    const toggleOptionalBtn = document.getElementById('toggleOptional');
    const optionalFields = document.getElementById('optionalFields');
    
    toggleOptionalBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        optionalFields.classList.toggle('show');
    });

    // List dropdown toggle
    const toggleListDropdownBtn = document.getElementById('toggleListDropdown');
    
    toggleListDropdownBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        if (listDropdown.classList.contains('hidden')) {
            // Show all lists
            showAllLists();
            listDropdown.classList.remove('hidden');
        } else {
            listDropdown.classList.add('hidden');
        }
    });

    function showAllLists() {
        listDropdown.innerHTML = '';
        bookLists.forEach(list => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedLists.includes(list);
            checkbox.addEventListener('change', () => toggleListSelection(list));
            
            const label = document.createElement('span');
            label.textContent = list;
            
            div.appendChild(checkbox);
            div.appendChild(label);
            listDropdown.appendChild(div);
        });
    }

    // Image upload and drag-drop
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageFileInput = document.getElementById('imageFileInput');
    const imageDropZone = document.getElementById('imageDropZone');
    const bookImageURL = document.getElementById('bookImageURL');
    const imagePreview = document.getElementById('imagePreview');

    uploadImageBtn.addEventListener('click', () => {
        imageFileInput.click();
    });

    imageFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    // Drag and drop handlers
    imageDropZone.addEventListener('click', () => {
        imageFileInput.click();
    });

    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.classList.add('drag-over');
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.classList.remove('drag-over');
    });

    imageDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        imageDropZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });

    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64 = e.target.result;
            bookImageURL.value = base64;
            imagePreview.src = base64;
            imagePreview.classList.add('show');
            imageDropZone.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    // Update the existing previewImageURL to work with new structure
    bookImageURL.addEventListener('input', function(e) {
        const url = e.target.value;
        if (url) {
            imagePreview.src = url;
            imagePreview.classList.add('show');
            imageDropZone.classList.add('has-image');
        } else {
            imagePreview.classList.remove('show');
            imageDropZone.classList.remove('has-image');
        }
    });



    // Heart explosion effect
    // Enhanced heart explosion effect
    function createHeartExplosion(x, y) {
        const heartCount = 15; // More hearts!
        const colors = ['#ff1744', '#ff4081', '#ff80ab', '#f50057', '#ff6b9d'];
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.innerHTML = '❤';
            heart.className = 'explosion-heart';
            
            // Random angle for more natural spread
            const angle = (Math.PI * 2 * i) / heartCount + (Math.random() - 0.5) * 0.5;
            const velocity = 80 + Math.random() * 80;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - Math.random() * 30; // Slight upward bias
            
            const size = 12 + Math.random() * 20;
            const duration = 600 + Math.random() * 400;
            
            heart.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                font-size: ${size}px;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events: none;
                z-index: 10000;
                --tx: ${tx}px;
                --ty: ${ty}px;
                animation: heartExplode ${duration}ms ease-out forwards;
            `;
            
            document.body.appendChild(heart);
            
            setTimeout(() => heart.remove(), duration);
        }
    }
});
