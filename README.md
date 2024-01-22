<p align="center"><img src="https://i.imgur.com/MZiw1Yp.png" alt="interchat logo" width="150px"/></p>

<p align="center"><strong>InterChat Translations</strong></p>

Welcome to the InterChat's Translations Repository! This repository contains all the translation YAML files for InterChat, a messaging discord bot designed for seamless cross-server communication.

## Getting Started

To contribute to the localization efforts or use the translations in your InterChat project, follow these steps:

1. **Select a Locale:**
    Choose the desired language YAML file to access the translations for that locale.
2. **Make Changes:**
    Edit the YAML files to update translations or add new ones. If it doesn't exist you can create a new YAML file for the language you with to translate.
3. **Contribute:**
    If you've made improvements or added translations for a new locale, feel free to create a pull request.

## File Structure

The repository follows a structured format where the file names is the [language code](https://developers.google.com/admin-sdk/directory/v1/languages) of the translated language:

en.yml: English locale files.

tr.yml: Turkish locale files.

... and so on.

## Contributing

We appreciate contributions! If you'd like to add support for a new language or improve existing translations, follow these steps:

1. Fork the repository.
2. Make your changes.
3. Commit and push your changes:

    ```bash
    git add .
    git commit -m "Add support for <language>"
    git push origin feature/new-locale
    ```

    You can also do it through github's UI.
4. Open a pull request.

## How to use the translation service
- Made by [tnfAngel](https://github.com/tnfAngel) and [LautyDev](https://github.com/LautyDev).

1. [src\locales\en.yml](https://github.com/LautyDev/Discord-InterChat-locales/blob/main/src/locales/en.yml) is the main file, there you have to upload everything with the original language.
2. Once you have put in everything you want to translate, run it:
    ```bash
    npm i
    npm run start
    ```
    You need to have [Node.js](https://nodejs.org/en) installed
3. Then you have to wait for the program to translate everything, the more data the longer it will take.

- Project originally from [FNLB](https://github.com/FNLB-Project/Perception) and edited to support YML

<p align="center"><image src="https://i.imgur.com/jjLpmXX.png" alt="Discord-InterChat Translation Service - Made by tnfAngel and LautyDev" width="800px"></p>

- NOTE: It is possible that in some cases unwanted spaces may be created in the translations, this cannot be avoided because this is how the Google Translator works, these spaces can be removed by hand anyway and the program will not touch them.

## Contact

If you have any questions or suggestions, feel free to open an issue or join our official [discord server](https://interchat.fun/support).
