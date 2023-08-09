# qbit-export

This is a tool I wrote to export `.torrent` files from qBittorrent, _with_ the announce field properly populated.

## Why not just copy BT_backup?

It seems from qBittorrent v4.4+ , qBittorrent splits the `.torrent` file internally in the `BT_backup` folder: The `.torrent` still has all the main stuff, but the announce URL is part of the corresponding `.fastresume` file.

As a result, if you were to simply copy all the `.torrent` from your `BT_backup` folder to import into another machine, you will lose all the announce URLs!

This program will parse both the `.torrent` and the `.fastresume` , splice the announce URL back into the `.torrent` , and then write the exported `.torrent` files to a new directory.

## Usage

You must have Node.JS installed, e.g. [via n](https://github.com/tj/n) (or similar). Recommended is v18.17+ (current LTS)

Install it via:

```
npm i -g qbit-export
```

And then run it via:

```
qbit-export [PATH TO BT_BACKUP] [PATH TO EXPORT TO]
```

Example:

```
qbit-export "/home/ubuntu/.local/share/qBittorrent/BT_backup/" "/tmp/export/"
```

## Help

If you need help, notice a bug or similar, please open an issue!
