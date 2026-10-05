# Contributing to XLICON-V2-MD

Thank you for your interest in contributing to **XLICON-V2-MD**! We welcome all contributions from bug reports and feature requests to code contributions and documentation improvements.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](file:///d:/BOTS-DATA/XLICON-V2-MD/CODE_OF_CONDUCT.md). Please treat all members of the community with respect and courtesy.

---

## How Can I Contribute?

### 1. Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When filing a bug report, please include:

- A clear and descriptive title.
- Steps to reproduce the problem.
- Expected behavior vs. actual behavior.
- Relevant logs or screenshots (make sure to **redact sensitive data** such as session credentials, API keys, and phone numbers).
- Your environment details (Node.js version, operating system, hosting platform).

### 2. Suggesting Enhancements

We are always looking for new features and ideas! When submitting a feature request:

- Provide a detailed explanation of the proposed feature.
- Explain why this feature would be useful to users of XLICON-V2-MD.
- Include examples of command syntax, mockups, or expected output if applicable.

### 3. Adding or Updating Plugins

XLICON-V2-MD uses a modular plugin structure located in the `plugins/` directory. When adding a new plugin:

- Follow existing plugin conventions and handler exports.
- Include appropriate command triggers, categories, and help descriptions.
- Ensure proper error handling and input validation.
- Avoid committing hardcoded credentials or malicious scripts.

---

## Development Setup

Follow these steps to set up the project locally:

1. **Fork the repository** on GitHub:
   [Fork XLICON-V2-MD](https://github.com/ahmmikun/XLICON-V2-MD/fork)

2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/XLICON-V2-MD.git
   cd XLICON-V2-MD
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure your environment**:
   - Create or update `.env` or `config.js` with your test credentials.
   - Obtain a test session ID.
   - **Never commit your session credentials or `.env` file.**

5. **Run the bot locally**:
   ```bash
   npm start
   ```

---

## Pull Request Guidelines

1. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Write clean and readable code**:
   - Follow JavaScript CommonJS conventions.
   - Use meaningful variable and function names.
   - Add comments explaining complex logic where appropriate.

3. **Test your changes**:
   - Ensure the bot runs without crashes or unhandled promise rejections.
   - Verify that your commands execute as expected in WhatsApp chats.

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add <feature-name> plugin"
   ```

5. **Push and open a Pull Request**:
   - Push to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```
   - Open a PR against the `main` branch of [XLICON-V2-MD](https://github.com/ahmmikun/XLICON-V2-MD).
   - Describe what changed and reference any related issues.

---

## Community & Support

- **WhatsApp Support Channel**: [Join Here](https://whatsapp.com/channel/0029VaMGgVL3WHTNkhzHik3c)
- **Contact Email**: [salmansheikh2500@gmail.com](mailto:salmansheikh2500@gmail.com)
