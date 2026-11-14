let diaryEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];

// HOME PAGE
function openDiary() {
    document.getElementById("home").style.display = "none";
    document.getElementById("diary").style.display = "block";
}

function goHome() {
    document.getElementById("diary").style.display = "none";
    document.getElementById("savedEntriesPage").style.display = "none";
    document.getElementById("home").style.display = "block";
}

// SAVE DIARY ENTRY
function saveEntry() {
    const name = document.getElementById("ownerName").value.trim();
    const date = document.getElementById("entryDate").value;
    const title = document.getElementById("entryTitle").value.trim();
    const entry = document.getElementById("diaryEntry").value.trim();
    const mood = document.getElementById("entryMood").value;
    const imageFile = document.getElementById("entryImage").files[0];
    const isFavorite = document.getElementById("entryFavorite").checked;

    if (!name || !date || !title || !entry) {
        alert("Please complete all fields! ♡");
        return;
    }

    function finishSaving(imageData) {
        const newEntry = {
            name: name,
            date: date,
            title: title,
            entry: entry,
            mood: mood,
            image: imageData,
            isFavorite: isFavorite
        };

        diaryEntries.unshift(newEntry);

        try {
            localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));
        } catch (error) {
            diaryEntries.shift();
            alert("Storage is full! Please use a smaller picture. ♡");
            return;
        }

        displayEntries();
        updateDiaryStats();

        document.getElementById("entryTitle").value = "";
        document.getElementById("diaryEntry").value = "";
        document.getElementById("entryMood").value = "";
        document.getElementById("entryImage").value = "";
        document.getElementById("entryFavorite").checked = false;

        alert("Your diary entry has been saved! ♡");
    }

    if (imageFile) {
        const reader = new FileReader();

        reader.onload = function() {
            finishSaving(reader.result);
        };

        reader.onerror = function() {
            alert("Unable to upload your picture. Please try again.");
        };

        reader.readAsDataURL(imageFile);
    } else {
        finishSaving("");
    }
}

// CREATE DIARY ENTRY DISPLAY
function createEntryCard(item, index) {
    const newEntry = document.createElement("div");

    const heading = document.createElement("h3");
    heading.textContent = item.title;

    const author = document.createElement("p");
    author.textContent = "By: " + item.name;

    const date = document.createElement("p");
    date.textContent = "Date: " + item.date;

    const mood = document.createElement("p");
    mood.textContent = "Mood: " + (item.mood || "Not selected");

    const favorite = document.createElement("p");
    favorite.textContent = item.isFavorite ? "❤️ Favorite" : "";

    const readButton = document.createElement("button");
    readButton.textContent = "Read Entry ♡";

    readButton.onclick = function() {
        alert(item.entry);
    };

    newEntry.append(heading, author, date, mood, favorite);

    if (item.image) {
        const picture = document.createElement("img");
        picture.src = item.image;
        picture.alt = "Diary memory";
        picture.style.width = "150px";
        picture.style.display = "block";
        newEntry.appendChild(picture);
    }

    const favoriteButton = document.createElement("button");
    favoriteButton.textContent = item.isFavorite
        ? "Remove Favorite ♡"
        : "Add to Favorites ♡";

    favoriteButton.onclick = function() {
        item.isFavorite = !item.isFavorite;

        localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));

        displayEntries();
        showEntries();
        updateDiaryStats();
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Entry 🗑️";

    deleteButton.onclick = function() {
        deleteEntry(index);
    };

    newEntry.append(readButton, favoriteButton, deleteButton);

    return newEntry;
}

// DISPLAY ENTRIES ON DIARY PAGE
function displayEntries() {
    const entriesContainer = document.getElementById("entries");

    entriesContainer.innerHTML = "";

    diaryEntries.forEach(function(item, index) {
        const card = createEntryCard(item, index);
        entriesContainer.appendChild(card);
    });
}

// SHOW SAVED ENTRIES
function showEntries() {
    document.getElementById("home").style.display = "none";
    document.getElementById("diary").style.display = "none";
    document.getElementById("savedEntriesPage").style.display = "block";

    displaySavedEntries();
    updateDiaryStats();
}

// DISPLAY SAVED ENTRIES WITH CALENDAR FILTER
function displaySavedEntries() {
    const savedEntriesList = document.getElementById("savedEntriesList");
    const selectedMonth = document.getElementById("diaryCalendar").value;

    savedEntriesList.innerHTML = "";

    const filteredEntries = diaryEntries
        .map(function(item, index) {
            return { item: item, index: index };
        })
        .filter(function(entry) {
            return !selectedMonth || entry.item.date.startsWith(selectedMonth);
        });

    if (filteredEntries.length === 0) {
        savedEntriesList.textContent = "No diary entries found. ♡";
        return;
    }

    filteredEntries.forEach(function(entry) {
        const card = createEntryCard(entry.item, entry.index);
        savedEntriesList.appendChild(card);
    });
}

// DELETE ENTRY
function deleteEntry(index) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this entry? ♡"
    );

    if (confirmDelete) {
        diaryEntries.splice(index, 1);

        localStorage.setItem("diaryEntries", JSON.stringify(diaryEntries));

        displayEntries();
        displaySavedEntries();
        updateDiaryStats();

        alert("Diary entry deleted! ♡");
    }
}

// DIARY STATISTICS
function updateDiaryStats() {
    const totalEntries = diaryEntries.length;

    const totalWords = diaryEntries.reduce(function(total, item) {
        const words = item.entry.trim().split(/\s+/).filter(Boolean).length;
        return total + words;
    }, 0);

    document.getElementById("totalEntries").textContent = totalEntries;
    document.getElementById("totalWords").textContent = totalWords;
}

// CALENDAR FILTER
document.getElementById("diaryCalendar").addEventListener("change", function() {
    displaySavedEntries();
});

// INITIAL DISPLAY
displayEntries();
updateDiaryStats();