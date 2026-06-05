import Setting from '../models/Setting.js';

export const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.getAll();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSetting = async (req, res) => {
  try {
    const value = await Setting.get(req.params.key);
    if (value === null) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrUpdateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ message: 'key and value required' });
    }
    const success = await Setting.set(key, value);
    if (success) {
      res.status(201).json({ message: 'Setting created/updated', key, value });
    } else {
      res.status(500).json({ message: 'Failed to save setting' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSetting = async (req, res) => {
  try {
    const success = await Setting.delete(req.params.key);
    if (success) {
      res.json({ message: 'Setting deleted' });
    } else {
      res.status(404).json({ message: 'Setting not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
