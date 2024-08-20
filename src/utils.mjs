import { Logger, LOGLEVEL } from '@ckcr4lyf/logger';
import bencode from 'bencode';
import fs from 'fs/promises';
import path from 'path';

export const getLogger = () => {
    return new Logger({ loglevel: LOGLEVEL.DEBUG });
};

/**
 * 
 * @param {string} dirname Path to qbit BT_Backup
 * @param {string} targetDir Path to export to
 * @param {boolean} useName Whether we should export to [torrentName].torrent
 * @param {string[]} tagsToFilter List of tags to filter when exporting
 * @param {string[]} categoriesToFilter List of categories to filter when exporting
 */
export const readQbitDir = async (dirname, targetDir, useName, tagsToFilter, categoriesToFilter) => {
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

            /**
             * The fastresume file contains other qBittorent metadata, such
             * as the tags, so we can pick them up from here as well, for filtering
             * @type {string[]}
             */
            const decodedTags = decodedFastresume['qBt-tags'].map(el => String.fromCharCode.apply(null, el));
            if (tagsToFilter.length !== 0){
                if (tagsToFilter.some(allowedTag => decodedTags.includes(allowedTag))) {
                    logger.debug(`Passed tag filter, processing...`);
                } else {
                    logger.debug(`Did not pass tag filter, skipping`);
                    continue;
                }
            }

            const decodedCategory = String.fromCharCode.apply(null, decodedFastresume['qBt-category']);
            if (categoriesToFilter.length !== 0){
                if (categoriesToFilter.includes(decodedCategory)){
                    logger.debug(`Passed category filter, processing...`);
                } else {
                    logger.debug(`Did not pass category filter, skipping`);
                    continue;
                }
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
