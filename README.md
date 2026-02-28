# WTF-CPF

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache-blue.svg)](https://opensource.org/licenses/apache-2-0)
[![CI](https://github.com/storopoli/WTF-CPF/actions/workflows/ci.yml/badge.svg?event=push)](https://github.com/storopoli/WTF-CPF/actions)

Whisky-Tango-Foxtrot CPF: **WTF-CPF**.

CPF is the Brazilian tax ID for physical persons (Cadastro de Pessoas Fisicas).

This is a research and testing project to generate plausible deniable CPF values in environments where it is required to input a tax ID.
The purpose is technical experimentation only, including studying how systems behave when CPF input is required and how broad validation or vigilance mechanisms react.

This project does **not** incentivize fraud, impersonation, or unlawful use of personal identifiers.

## How it works

The approach is intentionally simple:

1. Start from a CPF candidate and try changing one digit.
2. If that does not work, try changing two digits.
3. Continue increasing the number of changed digits until a candidate is accepted by the target validation rules.

## License

This work is dual-licensed under MIT and Apache 2.0.
You can choose between one of them if you use this work.