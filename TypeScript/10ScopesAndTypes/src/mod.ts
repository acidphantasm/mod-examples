import { DependencyContainer, Lifecycle } from "tsyringe";

import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod";
import { IPostSptLoadMod } from "@spt/models/external/IPostSptLoadMod";
import { MyMod } from "./MyMod";
import { Processing } from "./Processing";

class Mod implements IPreSptLoadMod, IPostSptLoadMod
{

    // Perform these actions before server fully loads
    public preSptLoad(container: DependencyContainer): void {
        // This class is registered as a singleton. This means ONE and only ONE bean
        // of this class will ever exist.
        container.register<MyMod>("MyMod", MyMod, {lifecycle: Lifecycle.Singleton});

        // This class is being registered as default or transient. This means that
        // every time a class requests a bean of this type a new one will be created
        container.register<Processing>("Processing", Processing);
    }

    public postSptLoad(container: DependencyContainer): void
    {
        // We will run this in a quick 5 loop to show how singletons and transients work
        for (let i = 0; i < 5; i++)
        {
            // every resolution will return the same MyMod bean
            container.resolve<MyMod>("MyMod").runModLogic();
        }
    }
}

export const mod = new Mod();
