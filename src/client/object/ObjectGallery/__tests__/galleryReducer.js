import galleryReducer, {
  getObjectAlbums,
  getIsObjectAlbumsLoading,
  mapAlbums,
} from '../galleryReducer';
import * as galleryActions from '../galleryActions';
import { dataAlbums } from '../__mock__/mockData';

describe('object Reducer', () => {
  it('should set the initial state if GET_ALBUMS.START', () => {
    expect(galleryReducer(undefined, { type: galleryActions.GET_ALBUMS.START })).toEqual({
      albumsLoading: true,
      error: null,
      albums: [],
    });
  });
  it('should set state with field which have error message if GET_ALBUMS.ERROR', () => {
    expect(
      galleryReducer([], { type: galleryActions.GET_ALBUMS.ERROR, message: 'some error message' }),
    ).toEqual({
      albumsLoading: false,
      error: 'some error message',
    });
  });
  it('should set field albums and turn field error to null if GET_ALBUMS.SUCCESS', () => {
    expect(
      galleryReducer([], {
        type: galleryActions.GET_ALBUMS.SUCCESS,
        meta: { authorPermlink: 'someValue' },
      }),
    ).toEqual({
      albums: [],
      albumsLoading: false,
      error: null,
    });
  });
  it('should add item to field albums if ADD_ALBUM', () => {
    expect(
      galleryReducer({ albums: [] }, { type: galleryActions.ADD_ALBUM, payload: dataAlbums }),
    ).toEqual({
      albums: [dataAlbums],
    });
  });
  it('should add item to field albums if ids are equals ADD_IMAGE', () => {
    const currentDefaultState = [
      { id: 'xvu-fisherman-sashimi', name: 'galleryAlbum', body: 'Photos', items: [] },
    ];
    expect(
      galleryReducer(
        { albums: currentDefaultState },
        { type: galleryActions.ADD_IMAGE, payload: dataAlbums[0].items[0] },
      ),
    ).toEqual({
      albums: [dataAlbums[0]],
    });
  });
  it('should return current state without adding item if ids are not equals ADD_IMAGE', () => {
    const currentDefaultState = [
      { id: 'notEqualId', name: 'galleryAlbum', body: 'Photos', items: [] },
    ];
    expect(
      galleryReducer(
        { albums: currentDefaultState },
        { type: galleryActions.ADD_IMAGE, payload: dataAlbums[0].items[0] },
      ),
    ).toEqual({
      albums: currentDefaultState,
    });
  });
  it('should set default state if RESET_GALLERY', () => {
    expect(galleryReducer([], { type: galleryActions.RESET_GALLERY })).toEqual({
      albums: [],
      albumsLoading: true,
      error: null,
    });
  });
  it('should keep state without changing if action type is default', () => {
    expect(
      galleryReducer(
        {
          albumsLoading: true,
          error: null,
          albums: [],
        },
        {},
      ),
    ).toEqual({
      albums: [],
      albumsLoading: true,
      error: null,
    });
  });
  it('should return albums by getObjectAlbums function', () => {
    const initialState = {
      albumsLoading: true,
      error: null,
      albums: dataAlbums,
    };
    expect(getObjectAlbums(initialState)).toEqual(dataAlbums);
  });
  it('should return state true of albumsLoading field by getIsObjectAlbumsLoading function', () => {
    const initialState = {
      albumsLoading: true,
      error: null,
    };
    expect(getIsObjectAlbumsLoading(initialState)).toEqual(true);
  });
  it('should return state false of albumsLoading field by getIsObjectAlbumsLoading function', () => {
    const initialState = {
      albumsLoading: false,
      error: null,
    };
    expect(getIsObjectAlbumsLoading(initialState)).toEqual(false);
  });
  it('should set default album and sort other albums by function mapAlbums', () => {
    const expected = [
      {
        id: 'next-id',
        name: 'galleryAlbum_next',
        body: 'Photos',
        items: [
          {
            weight: 2,
            locale: 'en-US',
            _id: '5cb7b02f70ba7150231feb76',
            creator: 'vancouverdining',
            author: 'x6oc5',
            permlink: 'vancouverdining-5151st60ku3',
            name: 'galleryItem',
            body: 'https://ipfs.busy.org/ipfs/QmYDtPfc4sVpNcwAnNoe5KddWWM3a2TETDz5dyG1JxZhyn',
            id: 'xvu-fisherman-sashimi',
          },
        ],
      },
      {
        body: 'Photos',
        id: 'xvu-fisherman-sashimi',
        items: [
          {
            _id: '5cb7b02f70ba7150231feb76',
            author: 'x6oc5',
            body: 'https://ipfs.busy.org/ipfs/QmYDtPfc4sVpNcwAnNoe5KddWWM3a2TETDz5dyG1JxZhyn',
            creator: 'vancouverdining',
            id: 'xvu-fisherman-sashimi',
            locale: 'en-US',
            name: 'galleryItem',
            permlink: 'vancouverdining-5151st60ku3',
            weight: 2,
          },
        ],
        name: 'galleryAlbum',
      },
    ];
    expect(mapAlbums(dataAlbums, dataAlbums[1].id)).toEqual(expected);
  });
});
