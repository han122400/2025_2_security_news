export default function HeroSection() {
  return (
    <div className="relative bg-linear-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden shadow-lg">
      {/* 배경 이미지 영역 */}
      <div
        className="relative h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect fill='%23a8d5f5' width='1200' height='600'/%3E%3Cg%3E%3Crect fill='%235a7ea0' x='100' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='240' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='380' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='520' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='660' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='800' y='150' width='120' height='300' rx='5'/%3E%3Crect fill='%235a7ea0' x='940' y='150' width='120' height='300' rx='5'/%3E%3C!-- 책상 --%3E%3Crect fill='%23a0826d' x='50' y='350' width='200' height='15'/%3E%3Crect fill='%23a0826d' x='300' y='350' width='200' height='15'/%3E%3Crect fill='%23a0826d' x='700' y='350' width='200' height='15'/%3E%3Crect fill='%23a0826d' x='950' y='350' width='200' height='15'/%3E%3C!-- 사람들 --%3E%3Cellipse fill='%23f4a261' cx='100' cy='280' rx='15' ry='20'/%3E%3Crect fill='%233a506b' x='85' y='300' width='30' height='50' rx='5'/%3E%3Cellipse fill='%23e76f51' cx='220' cy='280' rx='15' ry='20'/%3E%3Crect fill='%23bc4749' x='205' y='300' width='30' height='50' rx='5'/%3E%3Cellipse fill='%23f4a261' cx='340' cy='280' rx='15' ry='20'/%3E%3Crect fill='%23ffc8dd' x='325' y='300' width='30' height='50' rx='5'/%3E%3Cellipse fill='%23f4a261' cx='600' cy='250' rx='15' ry='20'/%3E%3Crect fill='%233a506b' x='585' y='270' width='30' height='60' rx='5'/%3E%3Cellipse fill='%23e76f51' cx='780' cy='280' rx='15' ry='20'/%3E%3Crect fill='%23c9184a' x='765' y='300' width='30' height='50' rx='5'/%3E%3Cellipse fill='%23f4a261' cx='1000' cy='280' rx='15' ry='20'/%3E%3Crect fill='%2390e0ef' x='985' y='300' width='30' height='50' rx='5'/%3E%3C!-- 모니터 --%3E%3Crect fill='%232d3142' x='60' y='300' width='80' height='50' rx='3'/%3E%3Crect fill='%2390e0ef' x='65' y='305' width='70' height='38'/%3E%3Crect fill='%232d3142' x='180' y='300' width='80' height='50' rx='3'/%3E%3Crect fill='%23333' x='185' y='305' width='70' height='38'/%3E%3Crect fill='%232d3142' x='750' y='300' width='80' height='50' rx='3'/%3E%3Crect fill='%23ffd166' x='755' y='305' width='70' height='38'/%3E%3Crect fill='%232d3142' x='960' y='300' width='80' height='50' rx='3'/%3E%3Crect fill='%2390e0ef' x='965' y='305' width='70' height='38'/%3E%3C!-- 화분 --%3E%3Cpolygon fill='%2352b788' points='560,380 540,420 580,420'/%3E%3Cpolygon fill='%2352b788' points='560,360 545,380 575,380'/%3E%3Crect fill='%23a98467' x='552' y='420' width='16' height='30' rx='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* 주요 뉴스 배지 */}
        <div className="absolute top-6 left-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white shadow-lg">
            주요 뉴스
          </span>
        </div>

        {/* 뉴스 내용 */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white via-white to-transparent p-8">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              오늘의 메인 뉴스: 중요한 변화의 시작
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              정치, 경제, 사회 전반에 걸쳐 중요한 변화가 일어나고 있습니다.
              전문가들은 이번 변화가 향후 우리 사회에 큰 영향을 미칠 것으로
              전망하고 있습니다.
            </p>
            <div className="mt-6">
              <span className="text-sm text-gray-500">방금 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
