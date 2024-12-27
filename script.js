let email_list = [];

// TrieNode Class
class TrieNode {
    constructor() {
        this.children = {};
        this.end_of_a_word = false;
    }
}

// Trie class
class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    // Insertion
    insert(word) {
        let node = this.root;
        for (let character of word) {
            if (!node.children[character]) {
                node.children[character] = new TrieNode();
            }
            node = node.children[character];
        }
        node.end_of_a_word = true;
    }

    // Autocomplete
    autocomplete(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return this._dfs(node, prefix);
    }

    // Depth First Search
    _dfs(node, prefix) {
        let results = [];
        if (node.end_of_a_word) {
            results.push(prefix);
        }
        for (let character in node.children) {
            results = results.concat(this._dfs(node.children[character], prefix + character));
        }
        return results;
    }
}

// Trie
const trie = new Trie();

function load_emails() {
    const stored_emails = JSON.parse(localStorage.getItem("email_list")) || [];
    email_list = stored_emails;

    stored_emails.forEach(email => {
        trie.insert(email);
    });
}

function save_emails() {
    localStorage.setItem("email_list", JSON.stringify(email_list));
}

// DOM Elements
const email_input = document.getElementById("email-input");
const suggestions_container = document.getElementById("suggestions");
const form = document.getElementById("email-form");

// Suggestions
email_input.addEventListener("input", () => {
    const query = email_input.value.trim();
    const suggestions = query ? trie.autocomplete(query) : [];
    suggestions_container.innerHTML = "";

    if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
            const div = document.createElement("div");
            div.textContent = suggestion;
            div.classList.add("suggestion");
            div.addEventListener("click", () => {
                email_input.value = suggestion;
                suggestions_container.innerHTML = "";
            });
            suggestions_container.appendChild(div);
        });
    } else if (query) {
        const div = document.createElement("div");
        div.textContent = "No suggestions";
        div.classList.add("no-suggestions");
        suggestions_container.appendChild(div);
    }
});

// Submission
form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = email_input.value.trim();
    const subject = document.getElementById("subject-input").value.trim();
    const message = document.getElementById("message-input").value.trim();

    if (email && subject && message) {

        // Insert email into trie if it doesn't exist
        if (!email_list.includes(email)) {
            email_list.push(email);
            trie.insert(email);
            save_emails();
        }

        // Reset
        email_input.value = "";
        document.getElementById("subject-input").value = "";
        document.getElementById("message-input").value = "";

        // Clear suggestions
        suggestions_container.innerHTML = "";

        alert("Email sent successfully!");
    } else {
        alert("Please fill in all fields.");
    }
});