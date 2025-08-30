# Project Overview

This project is a desktop Markdown file viewer built with Electron. It provides a clean, distraction-free environment for viewing Markdown documents with features like file loading, GitHub-style rendering, zoom controls, keyboard shortcuts, syntax highlighting, and word count.

**Key Technologies:**

*   **Framework:** Electron
*   **Frontend:** HTML, CSS, JavaScript
*   **Markdown Parsing:** marked.js
*   **Syntax Highlighting:** highlight.js

**Architecture:**

*   **Main Process (`main.js`):** Handles window management, file dialogs, and system integration.
*   **Renderer Process (`renderer.js`):** Manages UI interactions and Markdown rendering.
*   **UI (`index.html`):** The main user interface of the application.
*   **Styling (`styles.css`):** Provides a clean and modern interface design.

# Building and Running

**Prerequisites:**

*   Node.js (v16 or higher)
*   npm

**Running the Application:**

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the application:**
    ```bash
    npm start
    ```

3.  **Development mode (with DevTools):**
    ```bash
    npm run dev
    ```

**Building for Distribution:**

```bash
npm run build
```

This will create distributable packages in the `release` folder for your platform.

# Development Conventions

*   **Coding Style:** The project follows standard JavaScript and CSS conventions.
*   **Testing:** There are no explicit testing practices mentioned in the project.
*   **Contribution:** Contributions are welcome. You can submit issues, feature requests, or pull requests.
