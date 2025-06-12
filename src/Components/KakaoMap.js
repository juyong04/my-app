import React, { useEffect, useRef, useState } from "react";

const KakaoMap = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const [keyword, setKeyword] = useState("");
  const searchMarkerRef = useRef([]);
  const resultMarkerRef = useRef(null);
  const infowindowRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=65a00eaa71a2ca12f622ceb082837375&libraries=services&autoload=false";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const { maps } = window.kakao;

        const mapContainer = document.getElementById("map");
        if (!mapContainer) return; // ✅ null check

        const map = new maps.Map(mapContainer, {
          center: new maps.LatLng(37, 127.23),
          level: 3,
        });

        mapRef.current = map;
        infowindowRef.current = new maps.InfoWindow({ zIndex: 1 });

        maps.event.addListener(map, "click", (mouseEvent) => {
          searchMarkerRef.current.forEach((marker) => marker.setMap(null));
          searchMarkerRef.current = [];

          const latlng = mouseEvent.latLng;
          const lat = latlng.getLat();
          const lng = latlng.getLng();
          const places = new maps.services.Places();

          const keywords = [
            "한식", "중식", "일식", "양식", "베트남음식", "멕시칸", "이탈리안", "아시아음식",
            "피자", "치킨", "분식", "요리", "육류", "해물", "돈까스", "샐러드", "호프", "패스트푸드",
            "족발", "포장마차", "감자탕", "전골", "갈비", "찜닭", "베이커리", "디저트", "아이스크림",
            "음식점", "카페", "편의점", "마트", "버스정류장",
            "대덕면", "서동대로", "중앙대학교 다빈치캠퍼스", "중앙대학교", "중앙대", "기숙사",
            "음악관", "회관", "생명공학관", "재활용센터", "창업보육관", "금잔디동산", "테니스장",
            "BT기기센터", "수상무대", "학생후생관", "농구장", "체육대학", "청룔광장", "중앙마루",
            "실험농장", "교수", "조소관", "LMO", "청룡광장", "공연영상관"
          ];

          let allResults = [];
          let completed = 0;

          if (resultMarkerRef.current) resultMarkerRef.current.setMap(null);
          infowindowRef.current.close();

          const getDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371000;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
          };

          keywords.forEach((k) => {
            places.keywordSearch(
              k,
              (data, status) => {
                if (status === maps.services.Status.OK && data.length > 0) {
                  allResults = allResults.concat(
                    data.map((place) => ({
                      ...place,
                      distance: getDistance(lat, lng, place.y, place.x),
                    }))
                  );
                }
                completed++;
                if (completed === keywords.length) {
                  if (allResults.length === 0) {
                    alert("해당 위치 주변에 장소를 찾을 수 없습니다.");
                    return;
                  }

                  const nearest = allResults.sort((a, b) => a.distance - b.distance)[0];
                  const nearestLatLng = new maps.LatLng(nearest.y, nearest.x);

                  resultMarkerRef.current = new maps.Marker({
                    map,
                    position: nearestLatLng,
                  });

                  const content = document.createElement("div");
                  content.style.padding = "10px";
                  content.style.fontSize = "20px";
                  content.innerHTML = `
                    <strong>${nearest.place_name}</strong><br/>
                    ${nearest.road_address_name || nearest.address_name}<br/>
                    ${nearest.phone ? "☎ " + nearest.phone + "<br/>" : ""}
                    <a href="${nearest.place_url}" target="_blank">상세보기</a><br/>
                  `;

                  const selectBtn = document.createElement("button");
                  selectBtn.textContent = "선택하기";
                  selectBtn.style.marginTop = "6px";
                  selectBtn.style.display = "inline-block";
                  selectBtn.style.padding = "5px 10px";
                  selectBtn.style.fontSize = "20px";
                  selectBtn.style.cursor = "pointer";
                  selectBtn.style.border = "1px solid #ccc";
                  selectBtn.style.borderRadius = "4px";
                  selectBtn.style.backgroundColor = "#f0f0f0";

                  selectBtn.onclick = () => {
                    if (onLocationSelect) {
                      onLocationSelect(nearest.place_name);
                    }
                  };

                  content.appendChild(selectBtn);
                  infowindowRef.current.setContent(content);
                  infowindowRef.current.open(map, resultMarkerRef.current);
                  map.panTo(nearestLatLng);
                }
              },
              {
                location: latlng,
                radius: 500,
              }
            );
          });
        });
      });
    };
  }, [onLocationSelect]);

  const handleSearch = () => {
    if (!keyword || !mapRef.current) return;

    const { maps } = window.kakao;
    const places = new maps.services.Places();

    searchMarkerRef.current.forEach((marker) => marker.setMap(null));
    searchMarkerRef.current = [];
    if (resultMarkerRef.current) {
      resultMarkerRef.current.setMap(null);
      resultMarkerRef.current = null;
    }

    infowindowRef.current.close();

    places.keywordSearch("대덕면 " + keyword, (data, status) => {
      if (status === maps.services.Status.OK) {
        const bounds = new maps.LatLngBounds();

        data.forEach((place) => {
          const position = new maps.LatLng(place.y, place.x);
          const marker = new maps.Marker({ map: mapRef.current, position });

          maps.event.addListener(marker, "click", () => {
            const content = document.createElement("div");
            content.style.padding = "10px";
            content.style.fontSize = "20px";
            content.innerHTML = `
              <strong>${place.place_name}</strong><br/>
              ${place.road_address_name || place.address_name}<br/>
              ${place.phone ? "☎ " + place.phone + "<br/>" : ""}
              <a href="${place.place_url}" target="_blank">상세보기</a><br/>
            `;

            const selectBtn = document.createElement("button");
            selectBtn.textContent = "선택하기";
            selectBtn.style.marginTop = "6px";
            selectBtn.style.padding = "5px 10px";
            selectBtn.style.fontSize = "20px";
            selectBtn.style.cursor = "pointer";
            selectBtn.style.border = "1px solid #ccc";
            selectBtn.style.borderRadius = "4px";
            selectBtn.style.backgroundColor = "#f0f0f0";

            selectBtn.onclick = () => {
              if (onLocationSelect) {
                onLocationSelect(place.place_name);
              }
            };

            content.appendChild(selectBtn);
            infowindowRef.current.setContent(content);
            infowindowRef.current.open(mapRef.current, marker);
          });

          searchMarkerRef.current.push(marker);
          bounds.extend(position);
        });

        mapRef.current.setBounds(bounds);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  return (
    <div>
      <h2>거래 위치 선택</h2>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="장소 검색 (예: 스타벅스)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ padding: "8px", width: "250px", marginRight: "8px" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 12px" }}>
          검색
        </button>
      </div>
      <div
        id="map"
        style={{
          width: "100%",
          height: "300px",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      ></div>
    </div>
  );
};

export default KakaoMap;
