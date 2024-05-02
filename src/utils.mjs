import { Logger, LOGLEVEL } from '@ckcr4lyf/logger';
import bencode from 'bencode';
import fs from 'fs/promises';
import path from 'path';

export const getLogger = () => {
    return new Logger({ loglevel: LOGLEVEL.DEBUG });
};

export const readQbitDir = async (dirname, targetDir, useName) => {
    const logger = getLogger();

    const files = (await fs.readdir(dirname))
        .filter((filename) => filename.endsWith('.torrent'))
        .map((filename) => filename.split('.')[0]);

    for (const hash of files) {
        logger.info(`Processing infohash: ${hash}`);

        try {
            const torrentFile = await fs.readFile(path.join(dirname, `${hash}.torrent`));
            const fastresumeFile = await fs.readFile(path.join(dirname, `${hash}.fastresume`));

            const decodedTorrent = bencode.decode(torrentFile);
            const decodedFastresume = bencode.decode(fastresumeFile);

            if (decodedTorrent.announce !== undefined) {
                logger.warn(`Announce was not undefined! no need to export...`);
                continue;
            }

            decodedTorrent.announce = decodedFastresume.trackers[0][0];
            decodedTorrent['announce-list'] = decodedFastresume.trackers[0];

            const remake = bencode.encode(decodedTorrent);
            const dstFile = useName
                ? `${String.fromCharCode.apply(null, decodedFastresume.name)}_export.torrent`
                : `${hash}_export.torrent`;
            await fs.writeFile(path.join(targetDir, dstFile), remake);
            logger.info(`Wrote to ${dstFile}`);
        } catch (e) {
            logger.error(`Failed to process ${hash}, error: ${e}`);
        }
    }
};
