# Atomik Wallet

_A cross-platform wallet app made for payment on Kaspa network._

This app were originally made due to technical issues and limitation with Kaspium when used within Kasway. Designed with UI/UX in mind to help non-technical users to make transactions on Kaspa network.

This project is still under heavy development. Some features might not yet available.

## ⚒️ Architecture

<strong>Ionic V8</strong><br/>
An open source mobile UI toolkit for building modern, high quality cross-platform mobile apps from a single code base.

<strong>Vue 3</strong><br/>
An approachable, performant and versatile framework for building web user interfaces.

<strong>Typescript</strong><br/>
Type-safe codebase for reduced runtime errors.

<strong>Vite</strong><br/>
Bundling and development server for rapid iteration.

## Components

<strong>⚙️ [Kaspa WASM SDK](https://kaspa.aspectron.org/docs)</strong><br/>
Compiled Rust code for address derivation, and transaction signing.

<strong>🔐 [Secure Storage](https://github.com/aparajita/capacitor-secure-storage)</strong><br/>
Secure, flexible storage for Capacitor apps using iOS Keychain and Android Keystore.

<strong>🫆 [Biometric Auth](https://github.com/aparajita/capacitor-secure-storage)</strong><br/>
Easy access to native biometric auth APIs on iOS and Android

## Installation

1. Make sure you have Ionic framework installed.
2. Clone this repository
3. `cd` into the repository folder
4. Run `npm install` to install dependencies

## Usage

1. Run `ionic serve`
2. Visit `localhost:8100` on your web browser
3. [Read this](https://capacitorjs.com/docs/ios#running-your-app) if you prefer using iOS simulator
4. [Read this](https://capacitorjs.com/docs/android#running-your-app) if you prefer using Android simulator

## License

See the [LICENSE](./LICENSE) file for details.
