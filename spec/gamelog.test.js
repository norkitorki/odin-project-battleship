/**
 * @jest-environment jsdom
 */

import { Gamelog } from '../lib/gamelog';

describe('Gamelog', () => {
  beforeEach(() => {
    Array.from(document.body.children).forEach((el) => {
      document.body.removeChild(el);
    });
  });

  describe('#renderLog', () => {
    test('should append gamelog to parent element', () => {
      const log = Gamelog('myGameLog');
      const parent = document.createElement('div');
      log.renderLog(parent);
      const container = parent.querySelector('.myGameLog');

      expect(container).not.toBeNull();
      expect(container.nodeName).toBe('UL');
    });

    test('should append gamelog to body if parent is omitted', () => {
      const log = Gamelog('myGameLog');
      log.renderLog();
      const container = document.querySelector('.myGameLog');

      expect(
        Array.from(document.body.children).includes(container)
      ).toBeTruthy();
    });
  });

  describe('#addMessage', () => {
    test('should add message to log', () => {
      const log = Gamelog('myGameLog');
      log.renderLog();
      const message = 'This is the very first message in the log';
      log.addMessage(message);
      const logItem = document.querySelector('.myGameLog').children[0];

      expect(logItem.nodeName).toBe('LI');
      expect(logItem.textContent).toBe(`1. ${message}`);
    });

    test('should not index message when numbered is false', () => {
      const log = Gamelog('myGameLog');
      log.renderLog();
      const message = 'Another message added to the log';
      log.addMessage(message, false);
      const logItem = document.querySelector('.myGameLog').firstElementChild;

      expect(logItem.textContent).toBe(message);
    });
  });

  describe('#clear', () => {
    test('should clear log', () => {
      const log = Gamelog('myGameLog');
      log.renderLog();
      const container = document.querySelector('.myGameLog');
      ['some', 'messages', 'appended', 'to', 'log'].forEach((message) => {
        log.addMessage(message);
      });

      expect(container.children.length).toBe(5);
      log.clear();
      expect(container.children.length).toBe(0);
    });

    test('should reset message index', () => {
      const log = Gamelog('myGameLog');
      log.renderLog();
      const container = document.querySelector('.myGameLog');
      const messages = ['first message', 'second message'];
      messages.forEach((message) => log.addMessage(message));
      let children = Array.from(container.children);

      expect(children[0].textContent).toBe('2. second message');
      expect(children[1].textContent).toBe('1. first message');

      log.clear();
      messages.forEach((message) => log.addMessage(message));
      children = Array.from(container.children);

      expect(children[0].textContent).toBe('2. second message');
      expect(children[1].textContent).toBe('1. first message');
    });
  });
});
