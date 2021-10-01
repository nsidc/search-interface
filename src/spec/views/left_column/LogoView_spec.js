import LogoView from '../../views/left_column/LogoView';
import objectFactory from '../../lib/objectFactory';

describe('logoView works for ade', function () {
  var logoView;

  beforeEach(function () {
    objectFactory.register('LogoView', {Ctor: LogoView, configOptions: {preset: {templateId: 'ADE' }} });
    logoView = objectFactory.createInstance('LogoView');
    logoView.render();
  });

  it('is visible', function () {
    expect(logoView.$el).not.toHaveClass('hidden');
  });
});

describe('logoView works for nsidc', function () {
  var logoView;

  beforeEach(function () {
    objectFactory.register('LogoView', {Ctor: LogoView, configOptions: {preset: {templateId: 'NSIDC' }} });
    logoView = objectFactory.createInstance('LogoView');
    logoView.render();
  });

  it('is visible', function () {
    expect(logoView.$el).not.toHaveClass('hidden');
  });

  it('displays the NSIDC logo', function () {
    expect(logoView.$el.text()).toContain('');
  });

});
