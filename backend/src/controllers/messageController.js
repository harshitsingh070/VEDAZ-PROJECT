class MessageController {
  constructor(messageService) {
    this.messageService = messageService;
  }

  getAll = async (req, res, next) => {
    try {
      const messages = await this.messageService.getAll();
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const message = await this.messageService.create(req.body || {});
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = MessageController;
