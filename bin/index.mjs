#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
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

const argv = yargs(hideBin(process.argv))
    .command(
        '$0 [-n] [-t "comma,separated,tags"] [-c "comma,separated,categories"] <qbit_dir> <destination_dir>',
        'Export .torrent files from qBittorrent with the announce field properly populated',
        (yargs) => {
            yargs
                .positional('qbit_dir', {
                    describe: 'Path to the qBittorrent BT_backup directory',
                    type: 'string',
                })
                .positional('destination_dir', {
                    describe: 'Path to the directory where the exported files will be saved',
                    type: 'string',
                });
        },
    )
    .option('n', {
        alias: 'name',
        description: 'Use the torrent name for the destination file instead of the hash',
        type: 'boolean',
    })
    .option('t', {
        alias: 'tags',
        description: 'Filter tags to export (match at least one, comma-separated)',
        type: 'string',
    })
    .option('c', {
        alias: 'categories',
        description: 'Filter categories to export (match one of the categories, comma-separated)',
        type: 'string',
    })
    .alias('help', 'h')
    .demandCommand(2, 'You need to provide two directories').argv;

const QBIT_DIR = argv.qbit_dir;
const DESTINATION_DIR = argv.destination_dir;

let tagsToFilter = [];
if (argv.t !== undefined) {
    tagsToFilter.push(...argv.t.split(','));
}

let categoriesToFilter = [];
if (argv.c !== undefined) {
    categoriesToFilter.push(...argv.c.split(','));
}

try {
    fs.accessSync(QBIT_DIR, fs.constants.R_OK);
    if (fs.statSync(QBIT_DIR).isDirectory() === false) {
        logger.error(`Provided qbit directory is invalid! (${QBIT_DIR})`);
        process.exit(-1);
    }
} catch (error) {
    logger.error(`Cannot read qbit directory: ${QBIT_DIR}. Please check your permissions.`);
    process.exit(-1);
}

try {
    fs.accessSync(DESTINATION_DIR, fs.constants.R_OK | fs.constants.W_OK);
    if (fs.statSync(DESTINATION_DIR).isDirectory() === false) {
        logger.error(`Provided destination directory is invalid! (${DESTINATION_DIR})`);
        process.exit(-1);
    }
} catch (error) {
    logger.error(
        `Cannot read or write to destination directory: ${DESTINATION_DIR}. Please check your permissions.`,
    );
    process.exit(-1);
}

readQbitDir(QBIT_DIR, DESTINATION_DIR, argv.n, tagsToFilter, categoriesToFilter);
