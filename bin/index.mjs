import fs from 'fs';
import { readQbitDir } from './utils.mjs';

/**
 * TODO:
 * 
 * 1. List files in folder
 * 2. Group the .torrent & .fastresume
 * 3. (Sanity check) .torrent does not have announce / announce-list
 * 4. Populate announce & announce-list from .fastresume)
 * 5. Save as `export_${hash}.torrent`
 */

// TODO: CLI arg (w/ default)?
const QBIT_DIR = `/home/raghu/.local/share/qBittorrent/BT_backup`;

// TOOD: CLI arg (default to pwd?)
const DESTINATION_DIR = `/tmp`;

if (fs.statSync(QBIT_DIR).isDirectory() === false){
    throw new Error("The qbit directory is invalid");
}

if (fs.statSync(DESTINATION_DIR).isDirectory() === false){
    throw new Error("The destination directory is invalid");
}

readQbitDir(QBIT_DIR, DESTINATION_DIR);
