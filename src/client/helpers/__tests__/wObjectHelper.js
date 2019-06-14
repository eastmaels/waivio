import {
  haveAccess,
  accessTypesArr,
  hasType,
  prepareImageToStore,
  prepareAlbumData,
  prepareAlbumToStore,
  generateRandomString,
  generatePermlink,
} from '../wObjectHelper';
import { getField } from '../../objects/WaivioObject';

jest.mock('../../objects/WaivioObject');

describe('generateRandomString', () => {
  it('should return type of generated value', () => {
    const expected = 'string';
    const actual = typeof generateRandomString(1);
    expect(actual).toEqual(expected);
  });

  for (let i = 0; i < 25; i++) {
    it(`should return length is equals to ${i}`, () => {
      const expected = i;
      const actual = generateRandomString(i).length;
      expect(actual).toEqual(expected);
    });
  }
});

describe('generatePermLink', () => {
  it('should return type of generated value', () => {
    const expected = 'string';
    const actual = typeof generatePermlink();
    expect(actual).toEqual(expected);
  });

  it(`should return length is equals to 10 or 11`, () => {
    function checkLinkLength(generatedValue) {
      if (generatedValue.length === 10 || generatedValue.length === 11) {
        return true;
      }
    }
    const actual = generatePermlink();
    const expected = checkLinkLength(actual);
    expect(actual.length === 10 || actual.length === 11).toEqual(expected);
  });
});

describe('prepareAlbumToStore', () => {
  it('should return object', () => {
    const data = {
      field: {
        locale: 'en-US',
        name: 'galleryAlbum',
        body: 'galleryAlbumForm',
        id: 'randomIdValue',
      },
      author: 'Ivan',
      permlink: 'randomLinkValue',
    };
    const expectedObj = {
      locale: 'en-US',
      creator: 'Ivan',
      permlink: 'randomLinkValue',
      name: 'galleryAlbum',
      body: 'galleryAlbumForm',
      weight: 1,
      active_votes: [],
      items: [],
      id: 'randomIdValue',
    };

    const expected = JSON.stringify(expectedObj);
    const actual = JSON.stringify(prepareAlbumToStore(data));

    expect(actual).toEqual(expected);
  });
});

describe('prepareImageToStore', () => {
  it('should return object', () => {
    const postData = {
      field: {
        locale: 'en-US',
        name: 'galleryAlbum',
        body: 'galleryAlbumForm',
        id: 'randomIdValue',
      },
      author: 'Ivan',
      permlink: 'randomLinkValue',
    };

    const expectedObj = {
      weight: 1,
      locale: 'en-US',
      creator: 'Ivan',
      permlink: 'randomLinkValue',
      name: 'galleryAlbum',
      body: 'galleryAlbumForm',
      active_votes: [],
    };

    const expected = JSON.stringify(expectedObj);
    const actual = JSON.stringify(prepareImageToStore(postData));

    expect(actual).toEqual(expected);
  });
});

describe('hasType', () => {
  it('should return bolean value', () => {
    const wobj = {
      object_type: 'list',
    };
    const actual = hasType(wobj, 'list');
    expect(actual).toBeTruthy();
  });
});

describe('haveAccess', () => {
  it('should return true if user name is in array and first access type is exist', () => {
    const wobj = {
      is_extending_open: true,
      is_posting_open: true,
      white_list: ['Anna123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[0]);
    expect(actual).toEqual(true);
  });

  it('should return true if user name is in array and second access type is exist', () => {
    const wobj = {
      is_extending_open: true,
      is_posting_open: true,
      white_list: ['Anna123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[1]);
    expect(actual).toEqual(true);
  });

  it('should return true if user name is not in array and first access type is exist', () => {
    const wobj = {
      is_extending_open: true,
      is_posting_open: true,
      white_list: [],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[0]);
    expect(actual).toEqual(true);
  });

  it('should return true if user name is not in array and second access type is exist', () => {
    const wobj = {
      is_extending_open: true,
      is_posting_open: true,
      white_list: [],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[1]);
    expect(actual).toEqual(true);
  });

  it('should return true if user name is in array and first access type is not exist', () => {
    const wobj = {
      white_list: ['Anna123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[0]);
    expect(actual).toEqual(true);
  });

  it('should return true if user name is in array and second access type is not exist', () => {
    const wobj = {
      white_list: ['Anna123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[1]);
    expect(actual).toEqual(true);
  });

  it('should return false if user name is not in array and first access type is not exist', () => {
    const wobj = {
      white_list: ['Zina123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[0]);
    expect(actual).toEqual(false);
  });

  it('should return false if user name is not in array and second access type is not exist', () => {
    const wobj = {
      white_list: ['Zina123'],
    };
    const actual = haveAccess(wobj, 'Anna123', accessTypesArr[1]);
    expect(actual).toEqual(false);
  });
});

//deside problem with mocking nested function
/*
describe('prepareAlbumData', () => {



  it('should return type of generated value', () => {
    const form = {galleryAlbum: "album_1"};
    const currentUsername = "Vasya";
    const wObject = {author: "Vasya", author_permlink: "prLink_1"};
    getField.mockImplementation(() => 'name_123');
    Date.now = jest.fn();
    const a = prepareAlbumData(form, currentUsername, wObject);
    expect(getField).toHaveBeenCalledTimes(5);;

    // const actualObj = prepareAlbumData(form, currentUsername, wObject);
    // const actual = JSON.stringify(actualObj);
    // console.log(actual);
    // const data = {
    //   author: "Vasya",
    //   parentAuthor: "Vasya",
    //   parentPermlink: 'abc',
    //   body: `@Vasya created a new album: album_1.`,
    //   title: '',
    //
    //   field: {
    //     name: 'galleryAlbum',
    //     body: 'album_1',
    //     locale: 'en-US',
    //     id: 'abc',
    //   },
    //
    //   permlink: `Vasya-abc`,
    //   wobjectName: 'name'
    // };
    // const expected = JSON.stringify(data);
    // expect(actual).toEqual(expected);

  });

});

*/
