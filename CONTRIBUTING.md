# Contributing to the Project

Welcome to the project! We appreciate all contributions, big and small. To ensure code quality and simplify collaboration, we use `mamba-githook` to automatically run lint tests at every commit. Follow these steps to set up your development environment.

## Installing `mamba-githook`

`mamba-githook` is a tool that enables the automatic running of lint tests as part of git's pre-commit hook. This ensures that all code committed follows our coding standards.

To install `mamba-githook` on your Linux machine, follow the instructions:

- [Install mamba-githook for Linux](https://github.com/aydabd/mamba-githook)

## Configuring `mamba-githook` for Your Project

After installation, you need to configure `mamba-githook` to use the project-specific lint tests.

1. **Configure the git hook:**

    ```sh
    # In your repo root folder run this command
    mamba-githook init-project
    ```

2. **Test the `pre-commit` hook:**

   Try to make a commit with code that does not meet the lint rules. `mamba-githook` should automatically cancel the commit and show lint errors.

By following these steps, you have configured your development environment to automatically run lint tests at every commit, helping to maintain code quality and simplify collaboration in the project.
