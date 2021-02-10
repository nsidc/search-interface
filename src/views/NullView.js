define(
  ['views/InputViewBase'],
  function (InputViewBase) {

  var NullView;

  NullView = InputViewBase.extend({

    render: function () {
      return this;
    }
  });

  return NullView;
});
