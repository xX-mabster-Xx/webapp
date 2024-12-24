import React from 'react';

const Component1 = () => {
  return (
    <div>
      {/* Your Component 1 content */}
      <h2>Component 1</h2>
      <iframe
        frameBorder="0"
        style={{
          marginLeft: '50px',
          border: 'none',
          width: '600px',
          height: '800px',
        }}
        width="100%"
        height="500"
        src="https://music.yandex.ru/iframe/playlist/andrew.uso4/1010"
        title="Yandex Music Playlist"
      >
        Слушайте <a href='https://music.yandex.ru/users/andrew.uso4/playlists/1010'>phonk</a> — <a href='https://music.yandex.ru/users/andrew.uso4'>MABster</a> на Яндекс Музыке
    </iframe>

    </div>
  );
};

export default Component1;
