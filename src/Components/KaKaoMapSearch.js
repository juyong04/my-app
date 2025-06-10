import React, { useEffect } from 'react';

const KakaoMapSearch = ({ location}) => {
  useEffect(() => {
    //const fullKeyword = `${location} ${locationDetail}`.trim();
    if (!location) return;

    const script = document.createElement('script');
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=65a00eaa71a2ca12f622ceb082837375&libraries=services&autoload=false";
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본 서울
          level: 3,
        };

        const map = new window.kakao.maps.Map(container, options);
        const places = new window.kakao.maps.services.Places();

        // 장소 이름으로 검색
        places.keywordSearch(location, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

            new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            map.setCenter(coords);
          } else {
            console.warn('장소 검색 실패:', location);
          }
        });
      });
    };

    document.head.appendChild(script);
  }, [location]);

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '300px',
        marginTop: '16px',
        borderRadius: '8px',
        backgroundColor: '#f2f2f2',
      }}
    >
      지도를 불러오는 중입니다...
    </div>
  );
};

export default KakaoMapSearch;
