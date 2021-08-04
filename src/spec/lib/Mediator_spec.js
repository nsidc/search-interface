import Mediator from '../../lib/Mediator';

describe('Mediator', function () {
  it('can be constructed', function () {
    expect(new Mediator()).toBeDefined();
  });

  it('has the key methods for event observing and emitting', function () {
    var mediator = new Mediator();
    expect(mediator.on instanceof Function).toBe(true);
    expect(mediator.trigger instanceof Function).toBe(true);
    expect(mediator.bind instanceof Function).toBe(true);
  });

  it('re-broadcasts events triggered upon it', function () {
    var mediator = new Mediator(),
        payload = { data: 'data' },
        mockEventHandler = jest.fn()

    // arrange
    mediator.on('eventName', mockEventHandler);

    // act
    mediator.trigger('eventName', payload);

    // assert
    expect(mockEventHandler).toHaveBeenCalledWith(payload);
  });

});
