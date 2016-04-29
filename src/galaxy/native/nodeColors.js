export default {
  VERB: {
    string: '#e41a1c',
    hex: 0xe41a1cff
  },
  NOUN: {
    string: '#377eb8',
    hex: 0x377eb8ff
  },
  ADJECTIVE: {
    string: '#4daf4a',
    hex: 0x4daf4aff
  },
  ADVERB: {
    string: '#ff7f00',
    hex: 0xff7f00ff
  },
  getHexColor: function(pos) {
    switch (pos) {
      case 'n':
        return this.NOUN.hex;
      case 'v':
        return this.VERB.hex;
      case 'a':
        return this.ADJECTIVE.hex;
      case 's':
        return this.ADJECTIVE.hex;
      case 'r':
        return this.ADVERB.hex;
      default:
        return null;
    }
  },
  getStringColor: function(pos) {
    switch (pos) {
      case 'n':
        return this.NOUN.string;
      case 'v':
        return this.VERB.string;
      case 'a':
        return this.ADJECTIVE.string;
      case 's':
        return this.ADJECTIVE.string;
      case 'r':
        return this.ADVERB.string;
      default:
        return null;
    }
  },
  getAllPos: function() {
    return ['n', 'v', 'a', 'r'];
  }
}
