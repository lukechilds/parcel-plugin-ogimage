# parcel-plugin-ogimage

> Set absolute URL for og:image meta tags.

[![Build Status](https://travis-ci.com/lukechilds/parcel-plugin-ogimage.svg?branch=master)](https://travis-ci.com/lukechilds/parcel-plugin-ogimage)
[![npm](https://img.shields.io/npm/v/parcel-plugin-ogimage.svg)](https://www.npmjs.com/package/parcel-plugin-ogimage)

Sets absolute URLs for `og:image` meta tags. This is required by the spec and relative URLs will not work on some sites such as Twitter.

You can fix this directly in parcel by using `--public-url https://example.com`, however now all your URLs are hardcoded to absolute URLs which may be undesirable and can break things like prerendering.

This plugin uses the value of the `og:url` meta tag to convert `og:image` to absolute URL.

## Install

```shell
npm install parcel-plugin-ogimage
```

## Usage

Just install this package as a development dependency. Parcel will automatically call it when building your application.

You **must** have both `og:image` and `og:url` meta tags:

```html
<meta property="og:image" content="card.png">
<meta property="og:url" content="https://example.com">
```

Parcel will generate that into something like this:

```html
<meta property="og:image" content="/card.9190ce93.png">
<meta property="og:url" content="https://example.com">
```

`parcel-plugin-ogimage` will then update the `og:image` with an absolute URL:

```html
<meta property="og:image" content="https://example.com/card.9190ce93.png">
<meta property="og:url" content="https://example.com">
```

## License

MIT © Luke Childs
