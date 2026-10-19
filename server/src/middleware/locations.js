import { notFound } from '../errors.js';
import { BaseMiddleware } from './BaseMiddleware.js';

class LocationsMiddleware extends BaseMiddleware {
  constructor() {
    super('locations.json');
  }

  listCorporate = async (req, res) => {
    res.json(await this.where({ parent_id: null }));
  };

  listLocal = async (req, res) => {
    res.json((await this.all()).filter((location) => location.parent_id !== null));
  };

  load = async (req, res, next) => {
    req.location = await this.findById(req.valid.params.locationId);
    if (!req.location) throw notFound('Location');
    next();
  };
}

export const locations = new LocationsMiddleware();
