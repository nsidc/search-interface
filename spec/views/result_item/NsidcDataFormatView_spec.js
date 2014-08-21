define(
  ['views/result_item/NsidcDataFormatView'],
  function (NsidcDataFormatView) {

  describe('NSIDC Data Format View', function () {
    var model, el, dataFormatView;

    beforeEach(function () {
      el = document.createElement('div');
    });

    it('should display the word Data Formats when no data formats are present', function () {
      model = new Backbone.Model({});

      dataFormatView = new NsidcDataFormatView({el: el, model: model}).render();

      expect($(el).html()).toContain('Data Format');
    });

    it('should display the given data format', function () {
      model = new Backbone.Model({dataFormats: ['HDF']});

      dataFormatView = new NsidcDataFormatView({el: el, model: model}).render();

      expect($(el).html()).toContain('Data Format');
      expect($(el).html()).toContain('HDF');
      expect($(el).find('.data-format').length).toBe(1);
    });

    it('should display the multiple data formats', function () {
      model = new Backbone.Model({dataFormats: ['HDF', 'GeoTIFF']});

      dataFormatView = new NsidcDataFormatView({el: el, model: model}).render();

      expect($(el).html()).toContain('Data Format');
      expect($(el).html()).toContain('HDF');
      expect($(el).html()).toContain('GeoTIFF');
      expect($(el).find('.data-format').length).toBe(2);
    });
  });
});




