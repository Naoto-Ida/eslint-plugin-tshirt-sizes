# eslint-plugin-tshirt-sizes

An ESLint rule which enforces ordering of object keys based on T-shirt sizes. Useful for T-shirt size-based values for design systems, etc.

## Supported keys

- Keys which follow what I call "base sizes", meaning `S`, `M`, `L`.
- Keys which prefix these base sizes with the character `x`.

## Installation

`yarn add -D eslint-plugin-tshirt-sizes`

## Usage

Add `tshirt-sizes` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["tshirt-sizes"]
}
```

Since this plugin is intended for very specific use cases, it is best to set the rule via [configuration comments](https://eslint.org/docs/user-guide/configuring/rules#using-configuration-comments) for blocks where you define an object containing T-shirt sizes as keys.

```js
/* eslint tshirt-sizes/tshirt-sizes: "error" */
const softDrinkSizes = {
  s: 1,
  l: 3, // ERR: Expected object keys to be in ascending T-shirt size order. 'l' should be before 'm'.
  m: 2,
};
```

## Rule configuration

### Order

#### asc (default)

`/* eslint sort-keys: ["error"] */`

#### desc

`/ *eslint sort-keys: ["error", "desc"] */`

## Roadmap

- Add support for numerical prefixes like `2xl`, `3xs`
