import fs from 'fs';
import bencode from 'bencode';
import path from 'path';
import { Logger, LOGLEVEL } from '@ckcr4lyf/logger';

export const getLogger = () => {
    return new Logger({ loglevel: LOGLEVEL.DEBUG });
}

export const readQbitDir = (dirname, targetDir) => {
    const logger = getLogger();

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

            const decodedTorrent = bencode.decode(torrentFile);
            const decodedFastresume = bencode.decode(fastresumeFile);

            if (decodedTorrent.announce !== undefined){
                logger.warn(`Announce was not undefined! no need to export...`);
                continue;
            }

            decodedTorrent.announce = decodedFastresume.trackers[0][0];
            decodedTorrent['announce-list'] = decodedFastresume.trackers[0];

            const remake = bencode.encode(decodedTorrent);
            const dstFile = `${hash}_export.torrent`;
            fs.writeFileSync(path.join(targetDir, dstFile), remake);
            logger.info(`Wrote to ${dstFile}`);
        } catch (e){
            logger.error(`Failed to process ${hash}, error: ${e}`);
        }
    }
}