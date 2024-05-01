import { App, AppRunner, joinFilePath } from '@solid/community-server';

export type ConfigTemplate = "standard" | "vSolid";

export class Server {
  public app : App | null = null;
  private configTemplate : ConfigTemplate;
  private configPath : string;
  private port : number;

  constructor(configTemplate: ConfigTemplate, port: number) {
    this.configTemplate = configTemplate;
    switch (configTemplate) {
      case "standard": 
        this.configPath = joinFilePath(__dirname, '../../standard_config.json');
      default:
        this.configPath = joinFilePath(__dirname, '../../config.json');
    }
    this.port = port;
  }

  async start() {
    this.app = await new AppRunner().create(
      {
        // For testing we created a custom configuration that runs the server in memory so nothing gets written on disk.
        config: this.configPath,
        loaderProperties: {
          // Tell Components.js where to start looking for component configurations.
          // We need to make sure it finds the components we made in our project
          // so this needs to point to the root directory of our project.
          mainModulePath: joinFilePath(__dirname, '../../'),
          // We don't want Components.js to create an error dump in case something goes wrong with our test.
          dumpErrorState: false,
        },
        // We use the CLI options to set the port of our server to 3456
        // and disable logging so nothing gets printed during our tests.
        // Should you have multiple test files, it is important they all host their test server
        // on a different port to prevent conflicts.
        shorthand: {
          port: this.port,
          loggingLevel: 'off',
        },
        // We do not use any custom Components.js variable bindings and set our values through the CLI options below.
        // Note that this parameter is optional, so you can just drop it.
        variableBindings: {}
      } as any,
    );
  
    // This starts with the settings provided above
    await this.app.start();
    console.log("Server started on port " + this.port);
    return this.app;
  }
}