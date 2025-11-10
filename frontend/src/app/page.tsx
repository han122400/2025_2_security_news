import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import SearchBar from '@/components/SearchBar'
import NewsSection from '@/components/NewsSection'

// 샘플 뉴스 데이터
const newsData = {
  cyberSecurity: [
    {
      id: 1,
      title: '국내 주요 기업 대상 DDoS 공격 급증',
      summary:
        '최근 한 달간 국내 주요 기업들을 대상으로 한 DDoS 공격이 전월 대비 300% 증가한 것으로 나타났습니다.',
      date: '2시간 전',
      source: '보안뉴스',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    },
    {
      id: 2,
      title: '클라우드 보안 인증제도 개편안 발표',
      summary:
        '정부가 클라우드 서비스 보안 인증제도를 전면 개편하여 더욱 강화된 보안 기준을 적용하기로 했습니다.',
      date: '5시간 전',
      source: 'IT조선',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    },
    {
      id: 3,
      title: '금융권 사이버 보안 투자 확대',
      summary:
        '국내 주요 금융기관들이 올해 사이버 보안 예산을 전년 대비 40% 이상 증액했습니다.',
      date: '1일 전',
      source: '전자신문',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    },
    {
      id: 31,
      title: '국가 사이버 안보 전략 발표',
      summary:
        '정부가 새로운 국가 사이버 안보 전략을 발표하며 보안 예산을 대폭 증액하기로 했습니다.',
      date: '8시간 전',
      source: '보안뉴스',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    },
    {
      id: 32,
      title: '산업 제어 시스템 보안 취약점 경고',
      summary:
        '주요 산업 시설의 제어 시스템에서 심각한 보안 취약점이 발견되어 긴급 패치가 필요합니다.',
      date: '10시간 전',
      source: 'IT조선',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
    },
    {
      id: 33,
      title: '중소기업 사이버 보안 지원 사업 확대',
      summary:
        '정부가 중소기업의 사이버 보안 역량 강화를 위한 지원 사업을 대폭 확대한다고 밝혔습니다.',
      date: '12시간 전',
      source: '데일리시큐',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop',
    },
    {
      id: 34,
      title: '공공기관 보안 관제 시스템 고도화',
      summary:
        '주요 공공기관들이 AI 기반 보안 관제 시스템을 도입하여 24시간 위협 모니터링을 강화합니다.',
      date: '1일 전',
      source: '전자신문',
      category: '사이버보안',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    },
  ],
  hacking: [
    {
      id: 4,
      title: '글로벌 의료기관 랜섬웨어 공격 피해',
      summary:
        '미국 대형 의료기관이 랜섬웨어 공격을 받아 환자 데이터 수백만 건이 유출되었습니다.',
      date: '3시간 전',
      source: '보안뉴스',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    },
    {
      id: 5,
      title: '제로데이 취약점 악용 해킹 사례 증가',
      summary:
        '알려지지 않은 보안 취약점을 악용한 해킹 공격이 올해 들어 급증하고 있습니다.',
      date: '6시간 전',
      source: '데일리시큐',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop',
    },
    {
      id: 6,
      title: 'APT 그룹의 표적 공격 수법 진화',
      summary:
        '국가 배후 해킹 조직들의 공격 기법이 날로 정교해지고 있어 대응이 시급합니다.',
      date: '1일 전',
      source: 'IT조선',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1580584126903-c17d41830450?w=800&h=600&fit=crop',
    },
    {
      id: 35,
      title: '대형 쇼핑몰 고객정보 유출 사건',
      summary:
        '국내 대형 온라인 쇼핑몰에서 해킹으로 인한 고객 정보 100만 건 이상이 유출되었습니다.',
      date: '4시간 전',
      source: '보안뉴스',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
    },
    {
      id: 36,
      title: '공급망 공격 피해 기업 속출',
      summary:
        '소프트웨어 공급망을 통한 해킹 공격으로 다수의 기업이 피해를 입었습니다.',
      date: '9시간 전',
      source: '데일리시큐',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    },
    {
      id: 37,
      title: '암호화폐 거래소 해킹 사고',
      summary:
        '해외 주요 암호화폐 거래소가 해킹을 당해 수천억 원 상당의 암호화폐가 탈취되었습니다.',
      date: '15시간 전',
      source: 'IT조선',
      category: '해킹/침해사고',
      image:
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    },
  ],
  privacy: [
    {
      id: 7,
      title: '개인정보보호법 개정안 국회 통과',
      summary:
        '개인정보 유출 시 처벌 기준을 강화하는 내용의 개인정보보호법 개정안이 국회를 통과했습니다.',
      date: '4시간 전',
      source: '전자신문',
      category: '개인정보보호',
      image:
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
    },
    {
      id: 8,
      title: '기업 개인정보 관리 실태 점검 실시',
      summary:
        '개인정보보호위원회가 주요 기업들을 대상으로 개인정보 관리 실태 점검에 나섭니다.',
      date: '7시간 전',
      source: '보안뉴스',
      category: '개인정보보호',
      image:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    },
    {
      id: 9,
      title: 'GDPR 위반 과징금 역대 최고액 기록',
      summary:
        '유럽 기업이 개인정보 처리 위반으로 역대 최고액의 과징금을 부과받았습니다.',
      date: '2일 전',
      source: 'IT조선',
      category: '개인정보보호',
      image:
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
    },
  ],
  itTrends: [
    {
      id: 10,
      title: 'AI 기반 보안 솔루션 시장 급성장',
      summary:
        '인공지능을 활용한 보안 솔루션 시장이 연평균 35% 성장하며 급성장하고 있습니다.',
      date: '1시간 전',
      source: '데일리시큐',
      category: 'IT/보안 트렌드',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    },
    {
      id: 11,
      title: '양자암호통신 상용화 본격화',
      summary:
        '양자암호통신 기술이 상용화 단계에 접어들며 차세대 보안 기술로 주목받고 있습니다.',
      date: '4시간 전',
      source: '전자신문',
      category: 'IT/보안 트렌드',
      image:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    },
    {
      id: 12,
      title: '제로트러스트 보안 모델 도입 확산',
      summary: '국내 기업들이 제로트러스트 보안 모델 도입을 확대하고 있습니다.',
      date: '1일 전',
      source: 'IT조선',
      category: 'IT/보안 트렌드',
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    },
  ],
  malware: [
    {
      id: 13,
      title: '신종 랜섬웨어 공격 기법 발견',
      summary:
        '기존 백신으로 탐지되지 않는 신종 랜섬웨어 변종이 발견되어 주의가 요구됩니다.',
      date: '2시간 전',
      source: '보안뉴스',
      category: '악성코드/피싱',
      image:
        'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop',
    },
    {
      id: 14,
      title: '스미싱 문자 발송 건수 급증',
      summary:
        '택배, 금융기관을 사칭한 스미싱 문자가 급증하여 각별한 주의가 필요합니다.',
      date: '5시간 전',
      source: '데일리시큐',
      category: '악성코드/피싱',
      image:
        'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=600&fit=crop',
    },
    {
      id: 15,
      title: '악성 앱으로 위장한 멀웨어 주의보',
      summary:
        '정상 앱으로 위장한 악성코드가 유포되고 있어 앱 다운로드 시 주의가 필요합니다.',
      date: '1일 전',
      source: '전자신문',
      category: '악성코드/피싱',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    },
  ],
  securityProducts: [
    {
      id: 16,
      title: '차세대 방화벽 신제품 출시',
      summary:
        '국내 보안 기업이 AI 기반 위협 탐지 기능을 강화한 차세대 방화벽을 출시했습니다.',
      date: '3시간 전',
      source: 'IT조선',
      category: '보안제품/서비스',
      image:
        'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&h=600&fit=crop',
    },
    {
      id: 17,
      title: '클라우드 보안 솔루션 도입 사례 증가',
      summary:
        '중소기업들의 클라우드 보안 솔루션 도입이 전년 대비 2배 이상 증가했습니다.',
      date: '6시간 전',
      source: '보안뉴스',
      category: '보안제품/서비스',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    },
    {
      id: 18,
      title: 'EDR 솔루션 시장 성장세',
      summary:
        '엔드포인트 탐지 및 대응 솔루션 시장이 빠르게 성장하고 있습니다.',
      date: '2일 전',
      source: '데일리시큐',
      category: '보안제품/서비스',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
    },
  ],
  authentication: [
    {
      id: 19,
      title: '생체인증 기술 발전 동향',
      summary:
        '지문, 홍채 등 생체인증 기술이 더욱 정교해지며 보안성이 강화되고 있습니다.',
      date: '4시간 전',
      source: '전자신문',
      category: '인증·암호화',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
    },
    {
      id: 20,
      title: '공인인증서 폐지 후 본인인증 시장 변화',
      summary: '공인인증서 폐지 이후 간편인증 시장이 크게 성장하고 있습니다.',
      date: '7시간 전',
      source: 'IT조선',
      category: '인증·암호화',
      image:
        'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&h=600&fit=crop',
    },
    {
      id: 21,
      title: '블록체인 기반 인증 시스템 확대',
      summary:
        '블록체인 기술을 활용한 분산 인증 시스템 도입이 확대되고 있습니다.',
      date: '1일 전',
      source: '보안뉴스',
      category: '인증·암호화',
      image:
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    },
  ],
  networkSecurity: [
    {
      id: 22,
      title: '5G 네트워크 보안 취약점 발견',
      summary:
        '5G 네트워크에서 새로운 보안 취약점이 발견되어 대응책 마련이 시급합니다.',
      date: '2시간 전',
      source: '데일리시큐',
      category: '네트워크보안',
      image:
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
    },
    {
      id: 23,
      title: '모바일 앱 보안 강화 가이드 발표',
      summary:
        '과학기술정보통신부가 모바일 앱 개발 시 필수 보안 가이드라인을 발표했습니다.',
      date: '5시간 전',
      source: '전자신문',
      category: '네트워크보안',
      image:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
    },
    {
      id: 24,
      title: 'IoT 기기 보안 인증 의무화 추진',
      summary:
        '정부가 IoT 기기에 대한 보안 인증을 의무화하는 방안을 추진하고 있습니다.',
      date: '1일 전',
      source: 'IT조선',
      category: '네트워크보안',
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
    },
  ],
  policy: [
    {
      id: 25,
      title: 'ISMS-P 인증 취득 기업 증가',
      summary:
        '정보보호 및 개인정보보호 관리체계 인증을 취득하는 기업이 증가하고 있습니다.',
      date: '3시간 전',
      source: '보안뉴스',
      category: '정책·제도',
      image:
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
    },
    {
      id: 26,
      title: '사이버보안 관련 법안 개정 추진',
      summary:
        '정부가 사이버 보안 강화를 위한 관련 법안 개정을 추진하고 있습니다.',
      date: '6시간 전',
      source: '데일리시큐',
      category: '정책·제도',
      image:
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop',
    },
    {
      id: 27,
      title: '보안 사고 신고 의무화 법안 통과',
      summary:
        '일정 규모 이상의 보안 사고 발생 시 신고를 의무화하는 법안이 통과되었습니다.',
      date: '2일 전',
      source: '전자신문',
      category: '정책·제도',
      image:
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=600&fit=crop',
    },
  ],
  dataSecurity: [
    {
      id: 28,
      title: '데이터베이스 암호화 솔루션 도입 확대',
      summary:
        '금융권을 중심으로 데이터베이스 암호화 솔루션 도입이 확대되고 있습니다.',
      date: '4시간 전',
      source: 'IT조선',
      category: '데이터보안',
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    },
    {
      id: 29,
      title: '클라우드 백업 서비스 보안 강화',
      summary:
        '주요 클라우드 서비스 제공업체들이 백업 데이터 보안을 강화하고 있습니다.',
      date: '7시간 전',
      source: '보안뉴스',
      category: '데이터보안',
      image:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    },
    {
      id: 30,
      title: '서버 보안 취약점 정기 점검 권고',
      summary:
        '한국인터넷진흥원이 서버 보안 취약점에 대한 정기 점검을 권고했습니다.',
      date: '1일 전',
      source: '데일리시큐',
      category: '데이터보안',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop',
    },
  ],
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />

        {/* 검색창 */}
        <div className="my-12">
          <SearchBar />
        </div>

        <div className="mt-16">
          <NewsSection
            id="cyber-security"
            title="사이버보안"
            description="기업 및 국가 IT 시스템, 네트워크 등 전반적인 정보보호 관련 소식"
            articles={newsData.cyberSecurity}
          />

          <NewsSection
            id="hacking"
            title="해킹/침해사고"
            description="해킹 사례, 취약점, 정보유출, 보안사고 등 사건 중심의 기사"
            articles={newsData.hacking}
          />

          <NewsSection
            id="privacy"
            title="개인정보/산업기밀보호"
            description="유출 사건, 관리 방안, 법적 규제 등 정보보호 정책"
            articles={newsData.privacy}
          />

          <NewsSection
            id="it-trends"
            title="IT/보안 최신 트렌드"
            description="AI 보안, 양자보안, 클라우드 등 신기술 동향"
            articles={newsData.itTrends}
          />

          <NewsSection
            id="malware"
            title="악성코드/피싱"
            description="신종 바이러스, 랜섬웨어, 피싱·파밍 공격 관련 정보"
            articles={newsData.malware}
          />

          <NewsSection
            id="security-products"
            title="보안제품/서비스"
            description="기업 제품, 보안 강화 솔루션, 도입 및 활용 사례"
            articles={newsData.securityProducts}
          />

          <NewsSection
            id="authentication"
            title="인증·암호화"
            description="보안 인증 제도, 암호·인증 기술 동향"
            articles={newsData.authentication}
          />

          <NewsSection
            id="network-security"
            title="네트워크/웹/모바일 보안"
            description="네트워크·웹·모바일 환경 보안 위협 및 대응 관련 기사"
            articles={newsData.networkSecurity}
          />

          <NewsSection
            id="policy"
            title="정책·제도"
            description="ISMS 등 보안인증, 관련 법·규정 및 정부 정책"
            articles={newsData.policy}
          />

          <NewsSection
            id="data-security"
            title="데이터·운영체계 보안"
            description="OS·서버·DB 보안 및 백업, 데이터 보호"
            articles={newsData.dataSecurity}
          />
        </div>
      </main>
    </div>
  )
}
