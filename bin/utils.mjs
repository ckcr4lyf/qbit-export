import fs from 'fs';
import path from 'path';
import { Logger, LOGLEVEL } from '@ckcr4lyf/logger';

const getLogger = () => {
    return new Logger({ loglevel: LOGLEVEL.DEBUG });
}

export const readQbitDir = (dirname) => {
    const logger = getLogger();
    // TODO: Read the .torrent, and associating .fastresume

    // list of hashes we've already processed
    const done = [];

    // only `.torrent` files, and cut off the .torrent
    // (i.e. only infohash)
    const files = fs.readdirSync(dirname).filter(filename => filename.endsWith('.torrent')).map(filename => filename.split('.')[0]);

    for (const hash of files){
        logger.info(`Processing infohash: ${hash}`);

        try {
            const torrentFile = fs.readFileSync(path.join(dirname, `${hash}.torrent`));
            const fastresumeFile = fs.readFileSync(path.join(dirname, `${hash}.fastresume`));

        } catch (e){
            logger.error(`Failed to process, error: ${e}`);
        }
    }
}