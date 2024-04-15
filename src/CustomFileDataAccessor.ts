import { FileDataAccessor, FileIdentifierMapper } from "@solid/community-server";
import { Readable } from "stream";

export class CustomFileDataAccessor extends FileDataAccessor {
    public constructor(resourceMapper: FileIdentifierMapper) {
        super(resourceMapper)
    }

    protected async writeDataFile(path: string, data: Readable): Promise<void> {
        console.log("Now writing data to path:" + path)

        let dataString = '';
        data.on('data', chunk => {
            dataString += chunk;
        });
        data.on('end', () => {
            console.log("Data:", dataString);
        });

        data.on('error', err => {
            console.error("Error reading data:", err);
        });

        super.writeDataFile(path, data)
      }
}