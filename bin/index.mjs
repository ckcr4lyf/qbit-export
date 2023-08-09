import fs from 'fs';
import { getLogger, readQbitDir } from '../src/utils.mjs';

const logger = getLogger();

/**
 * TODO:
 * 
 * 1. List files in folder
 * 2. Group the .torrent & .fastresume
 * 3. (Sanity check) .torrent does not have announce / announce-list
 * 4. Populate announce & announce-list from .fastresume)
 * 5. Save as `export_${hash}.torrent`
 */

if (process.argv.length !== 4){
    logger.warn(`Usage: qbit-export [path to BT_backup] [path to folder to export to]`);
    process.exit(1);
}

const QBIT_DIR = process.argv[2];
const DESTINATION_DIR = process.argv[3];

if (fs.statSync(QBIT_DIR).isDirectory() === false){
    logger.error(`Provided qbit directory is invalid! (${QBIT_DIR})`);
    process.exit(-1);
}

if (fs.statSync(DESTINATION_DIR).isDirectory() === false){
    logger.error(`Provided destination directory is invalid! (${DESTINATION_DIR})`);
    process.exit(-1);
}

readQbitDir(QBIT_DIR, DESTINATION_DIR);
