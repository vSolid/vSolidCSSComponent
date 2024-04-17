import { FileDataAccessor, FileIdentifierMapper, getLoggerFor } from "@solid/community-server";
import { Readable } from "stream";

export class CustomFileDataAccessor extends FileDataAccessor {
    public constructor(resourceMapper: FileIdentifierMapper) {
        super(resourceMapper)
    }

    protected async writeDataFile(path: string, data: Readable): Promise<void> {
        this.logger.info("Now writing data to path:" + path)

        let dataString = '';
        data.on('data', chunk => {
             dataString += chunk;
        });
        data.on('end', () => {
             this.logger.info(`Data:` + dataString);
        });

        data.on('error', err => {
            this.logger.error(`Error reading data:, ${err}`);
        });

        super.writeDataFile(path, data)
      }
}