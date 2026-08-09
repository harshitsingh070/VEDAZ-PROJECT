class MessageController {
  constructor(messageService) {
    this.messageService = messageService;
  }

  getAll = (req, res, next) => {
    try {
      res.json({ success: true, data: this.messageService.getAll() });
    } catch (error) {
      next(error);
    }
  };

  create = (req, res, next) => {
    try {
      const { senderId, senderName, text } = req.body || {};
      const message = this.messageService.create({ senderId, senderName, text });
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = MessageController;
