# core/

The Exura files every exploration and scenario uses. Filled by `php exura`, never by hand, never committed:

| File | Fetched by |
|---|---|
| `exura.css` | `php exura css` |
| `exura-clip.css` | `php exura css --part=clip` |
| `exura.js` | `php exura js` |
| `exura.php` | `php exura php` |

`php exura setup --dist=core/ --tags=1.1.0 --install` fetches css, js and php at once; the clip comes with `php exura css --part=clip`.

Pages link them as `/core/exura.css`; PHP finds `core/exura.php` by walking up the folders.
