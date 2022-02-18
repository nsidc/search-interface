import tokenizer from '../../lib/searchTermsTokenizer';

describe('Search Terms Tokenizer', function () {
    it('tokenizes a single simple word into an array', function () {
        expect(tokenizer.tokenize('one')).toEqual(['one']);
    });

    it('tokenizes three simple words into an array', function () {
        expect(tokenizer.tokenize('one two three')).toEqual(['one', 'two', 'three']);
    });

    it('tokenizes a phrase into a single item in the array', function () {
        expect(tokenizer.tokenize('"two three"')).toEqual(['two three']);
    });

    it('treats phrases without a closing double quote as individual terms', function () {
        expect(tokenizer.tokenize('"a b" "two three')).toEqual(['a b', 'two', 'three']);
    });

    it('tokenizes phrases into items in the array', function () {
        expect(tokenizer.tokenize('"snow field" "ice storm"')).toEqual(['snow field', 'ice storm']);
    });

    it('unfortunately treats non-ASCII chars as a word boundary', function () {
        expect(tokenizer.tokenize('Jökulsárlón')).toEqual(['Jökulsárlón']);
    });

    it('strips leading and trailing spaces', function () {
        expect(tokenizer.tokenize('  one  ')).toEqual(['one']);
    });

    it('splits words when they have certain special characters', function () {
        expect(tokenizer.tokenize('one+two')).toEqual(['one', 'two']);
        expect(tokenizer.tokenize('one*two')).toEqual(['one', 'two']);
        expect(tokenizer.tokenize('one%two')).toEqual(['one', 'two']);
        expect(tokenizer.tokenize('one&two')).toEqual(['one', 'two']);
        expect(tokenizer.tokenize('one\\two')).toEqual(['one', 'two']);
        expect(tokenizer.tokenize('pipe|two')).toEqual(['pipe', 'two']);
        expect(tokenizer.tokenize('quote"two')).toEqual(['quote', 'two']);
    });

    it('does not split words when they contain hyphens, slashes, or single quotes', function () {
        expect(tokenizer.tokenize('one/two')).toEqual(['one/two']);
        expect(tokenizer.tokenize('one-two')).toEqual(['one-two']);
        expect(tokenizer.tokenize('one\'two')).toEqual(['one\'two']);
    });

    it('does not split phrases when they have a forward slash', function () {
        expect(tokenizer.tokenize('"one/two"')).toEqual(['one/two']);
    });

    it('trims all special characters off the start of words', function () {
        expect(tokenizer.tokenize('/one')).toEqual(['one']);
        expect(tokenizer.tokenize('+one')).toEqual(['one']);
        expect(tokenizer.tokenize('*one')).toEqual(['one']);
        expect(tokenizer.tokenize('%one')).toEqual(['one']);
        expect(tokenizer.tokenize('&one')).toEqual(['one']);
        expect(tokenizer.tokenize('\\one')).toEqual(['one']);
        expect(tokenizer.tokenize('|one')).toEqual(['one']);
        expect(tokenizer.tokenize('\'one')).toEqual(['one']);
        expect(tokenizer.tokenize('-one')).toEqual(['one']);
        expect(tokenizer.tokenize('\'one')).toEqual(['one']);
        expect(tokenizer.tokenize('(paren')).toEqual(['paren']);
    });

    it('trims most special characters off the end of words', function () {
        expect(tokenizer.tokenize('one/')).toEqual(['one']);
        expect(tokenizer.tokenize('one,')).toEqual(['one']);
        expect(tokenizer.tokenize('one+')).toEqual(['one']);
        expect(tokenizer.tokenize('one*')).toEqual(['one']);
        expect(tokenizer.tokenize('one%')).toEqual(['one']);
        expect(tokenizer.tokenize('one&')).toEqual(['one']);
        expect(tokenizer.tokenize('one\\')).toEqual(['one']);
        expect(tokenizer.tokenize('one|')).toEqual(['one']);
        expect(tokenizer.tokenize('one"')).toEqual(['one']);
        expect(tokenizer.tokenize('one-')).toEqual(['one']);
        expect(tokenizer.tokenize('colon:')).toEqual(['colon']);
        expect(tokenizer.tokenize('paren)')).toEqual(['paren']);
    });

    it('does not trim single quotes or periods off the end of words', function () {
        expect(tokenizer.tokenize('one\'')).toEqual(['one\'']);
        expect(tokenizer.tokenize('one.')).toEqual(['one.']);
    });

    it('truncates single-character words down to empty searches', function () {
        expect(tokenizer.tokenize('s')).toEqual('');
        expect(tokenizer.tokenize('/')).toEqual('');
        expect(tokenizer.tokenize('s / a')).toEqual('');
        expect(tokenizer.tokenize('a a a')).toEqual('');
    });

    it('truncates search terms made up of special characters to empty searches', function () {
        expect(tokenizer.tokenize('////----%%%')).toEqual('');
        expect(tokenizer.tokenize('/// ---- %%%%')).toEqual('');
    });
});
