"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const entity_1 = require("./entity");
class Location extends entity_1.Entity {
    constructor(dbo) {
        super(dbo, 'locations');
    }
    get(req, res) {
        const id = req.params.id;
        this.findOne({ _id: new mongodb_1.ObjectID(id) }).then((r) => {
            if (r) {
                res.send(JSON.stringify(r, null, 3));
            }
            else {
                res.send(JSON.stringify(null, null, 3));
            }
        });
    }
}
exports.Location = Location;
//# sourceMappingURL=location.js.map