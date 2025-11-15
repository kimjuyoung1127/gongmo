Domain 
홈
AI Services
CLOVA OCR
CLOVA OCR 사용
Domain
Domain
Classic/VPC 환경에서 이용 가능합니다 .

Domain에서는 도메인을 생성하고 도메인을 관리할 수 있습니다. 도메인은 CLOVA OCR 서비스의 기준이 되는 단위입니다. 예를 들어 ‘고지서’ OCR을 생성하려는 경우 인식 대상이 되는 모든 고지서의 템플릿을 포함하는 단위가 도메인입니다. 따라서 템플릿 생성 및 채널 연동, 통계 정보까지 하나의 도메인을 기준으로 동작하고 관리합니다.
도메인의 서비스 타입에는 General, Template, Document가 있습니다. 여기에서는 도메인 서비스 타입별 공통 내용인 Domain 화면 구성, 외부 연동을 위한 API Gateway 연동 방법을 소개하고, 도메인 생성 및 관리 방법을 간단하게 설명합니다. 서비스 타입별 도메인을 생성하고 관리하는 자세한 방법은 다음 가이드를 참고해 주십시오.

서비스 타입이 General인 도메인: 텍스트/표를 추출하는 OCR
생성하고 관리하는 방법: General
서비스 타입이 Template인 도메인: 판독 영역을 직접 지정하여 인식값 추출 후 테스트 및 결과 전송이 가능한 템플릿 빌더를 지원하는 OCR
생성하고 관리하는 방법: Template
서비스 타입이 Document인 도메인: 머신러닝 기반으로 문서의 의미적 구조를 이해하는 특화 모델 엔진을 탑재하여 입력 정보(key-value)를 자동 추출하는 OCR
생성하고 관리하는 방법: Document
Domain 화면
Domain 이용을 위한 기본적인 설명은 다음과 같습니다.

clovaocr-domain_01_250327_ko.png

영역	설명
① 메뉴 이름	현재 확인 중인 메뉴 이름
② 기본 기능	도메인 생성, 특화 모델 설정, 서비스 상세 정보 확인, 화면 새로고침
③ 생성 후 기능	도메인 삭제, 복사, 검색
④ 도메인 목록	도메인 목록 및 기본 정보 확인, 동작 설정
도메인 목록 확인
도메인 목록에서 도메인별 정보를 확인할 수 있습니다. 확인하는 방법은 다음과 같습니다.

네이버 클라우드 플랫폼 콘솔의 Region 메뉴에서 이용 중인 리전을 클릭하여 선택해 주십시오.
Platform 메뉴에서 VPC와 Classic 가운데 클릭하여 선택해 주십시오.
Services > AI Services > CLOVA OCR 메뉴를 차례대로 클릭해 주십시오.
Domain 메뉴를 클릭해 주십시오.
도메인 목록이 나타나면 기본 정보를 확인해 주십시오.
도메인 ID: 도메인을 식별하는 고유한 아이디
도메인 이름: 도메인을 식별하는 고유한 이름
도메인 코드: 도메인을 식별하는 고유한 코드
지원 언어: 도메인에서 지원하는 언어의 종류. 한국어, 일본어, 대만어(중국어 번체)가 있으며, 영어는 표시 없어도 기본 지원
인식 모델: 서비스 타입이 Template이거나 Document인 도메인에 적용된 인식률 수준이나 인식 대상의 종류
인식 모델	Basic	Premium	설명
모델 인식률	활자체 및 필기체 인식	활자체 및 필기체 인식	주요 비즈니스 활용에 최적화된 고성능 OCR 인식 모델을 제공
적합 문서	증명서, 고정 폼 양식	수기 신청서 가입 양식, 금융 문서 등	-
인식 템플릿 레이아웃	제공	제공	인식 영역을 설정
멀티박스	미제공	제공	싱글 박스 템플릿을 조합하여 번호 인식영역 등을 제어
체크박스	미제공	제공	체크 박스 형태의 인식 제공
필드 유형	미제공	제공	인식 값을 숫자로만 인식되도록 유형을 설정
미인식	미제공	제공	일반 필드 지정 후 필드 내 특정 영역 마스킹
판독 결과 결합	미제공	제공	개별 필드의 결과를 결합하여 ‘새로운 값’으로 출력
체크 박스 인식 결과 문자 변환	미제공	제공	체크 박스의 리턴 값을 특정 문자로 치환
서비스 타입이 Template인 도메인인 경우
Basic 모델: 기본 엔진을 탑재하여 템플렛 레이아웃 등 기본적인 인식 기능을 제공
Premium 모델: 템플릿 레이아웃, 멀티 박스, 필드 입력 값 Value type 설정, 필기체 인식 포함 등 더욱 정교하고 다양한 인식 기능을 제공하는 Premium 모델
서비스 타입이 Document인 도메인인 경우
도메인에서 인식하는 특화 모델 종류
서비스 플랜: 도메인에 적용된 요금제 종류
템플릿 수: 등록한 템플릿 개수
등록된 템플릿: 등록한 템플릿 이름. 전체 목록을 확인하려면 [템플릿 빌더] 버튼 클릭
도메인 생성일: 도메인을 생성한 날짜
최종 수정일: 도메인을 마지막으로 수정한 날짜
동작: 서비스 타입별 도메인을 관리하고 설정할 수 있는 화면으로 이동
참고
Domain 목록에서 도메인 정보를 입력하거나 설정하여 원하는 도메인을 검색할 수 있습니다.
clovaocr-domain_02_ko

도메인 생성
도메인을 생성하는 방법은 서비스 타입별로 조금씩 차이가 있습니다. 서비스 타입별 생성 방법은 다음 가이드를 참고해 주십시오.

서비스 타입이 General인 도메인을 생성하고 관리하는 방법: General
서비스 타입이 Template인 도메인을 생성하고 관리하는 방법: Template
서비스 타입이 document인 도메인을 생성하고 관리하는 방법: Document
주의
서비스 타입이 General인 도메인은 리전당 1개만 생성할 수 있습니다.

도메인 삭제
도메인을 삭제하는 방법은 다음과 같습니다.

네이버 클라우드 플랫폼 콘솔의 Region 메뉴에서 이용 중인 리전을 클릭하여 선택해 주십시오.
Platform 메뉴에서 VPC와 Classic 가운데 클릭하여 선택해 주십시오.
Services > AI Services > CLOVA OCR 메뉴를 차례대로 클릭해 주십시오.
Domain 메뉴를 클릭해 주십시오.
5 삭제할 도메인을 클릭한 다음 [도메인 삭제] 버튼을 클릭해 주십시오.
도메인 삭제 팝업 창이 나타나면 [삭제] 버튼을 클릭해 주십시오.
[확인] 버튼을 클릭해 주십시오.
도메인 복사
이미 생성한 도메인을 복사하여 새로운 도메인을 생성할 수 있습니다. 복사 후 인식 모델을 변경이 가능하며, Premium에서 Basic으로 변경 시 Premium 기능은 복사되지 않고 Basic 기능만 복사됩니다. 도메인을 복사하여 생성하는 방법은 다음과 같습니다.

참고
서비스 타입이 General인 도메인은 리전당 1개만 생성할 수 있기 때문에 복사를 통한 추가 생성이 불가능합니다.

네이버 클라우드 플랫폼 콘솔의 Region 메뉴에서 이용 중인 리전을 클릭하여 선택해 주십시오.
Platform 메뉴에서 VPC와 Classic 가운데 클릭하여 선택해 주십시오.
Services > AI Services > CLOVA OCR 메뉴를 차례대로 클릭해 주십시오.
Domain 메뉴를 클릭해 주십시오.
복사할 도메인을 클릭한 다음 [도메인 복사] 버튼을 클릭해 주십시오.
도메인 생성 팝업 창이 나타나면 필요한 정보를 입력해 주십시오.
복사하려는 도메인의 정보와 동일하게 자동 입력되어 있음
도메인 이름과 코드는 도메인별 고유한 값이므로 새롭게 입력 필요
[도메인 생성] 버튼을 클릭해 주십시오.
API Gateway 연동
CLOVA OCR은 사용자의 애플리케이션에서 CLOVA OCR을 호출하여 사용할 수 있도록 외부 연동을 위한 InvokeURL을 제공합니다. InvokeURL은 각 도메인별로 고유한 값으로, 안전한 서비스 제공을 위해 외부 서비스에 바로 공개하지 않고 보안 및 서비스 처리 수준을 높이기 위해 반드시 네이버 클라우드 플랫폼의 API Gateway와 연동하여 사용하도록 설계되어 있습니다. API Gateway와 연동하여 서비스를 처리하는 흐름을 정리하면 다음과 같습니다.

도메인의 OCR InvokeURL 확인 → API Gateway의 Endpoint로 연결 → 외부 연동
Plain textCopy
사용자가 생성한 OCR 인식 호출 Endpoint는 도메인의 invokeURL이며, 이 API를 통해 이미지를 입력하고 인식값을 반환받을 수 있습니다. 이러한 API Gateway 연동 방법에는 자동과 수동이 있습니다. 수동 연동은 자동 연동에 비해 사용자가 직접 세세한 설정이 가능하다는 특징이 있지만 기본적으로 동일한 기능을 제공하기 때문에 간편한 자동 연동의 사용을 권장합니다.

주의
API Gateway 이용 신청 시 별도의 요금이 부과됩니다. API Gateway 소개와 요금제에 대한 설명은 네이버 클라우드 플랫폼 포털의 서비스 > Application Services > API Gateway 메뉴를 참조해 주십시오.

자동 연동
자동 연동은 도메인의 OCR Invoke URL과 API Gateway Endpoint 연결을 자동으로 제공합니다. 자동 연동 방법은 다음과 같습니다.

도메인을 생성한 후 자동 연동 설정 화면으로 이동해 주십시오.
General: [API Gateway 연동] 버튼 클릭
clovaocr-domain_03_230530_ko
Template: [템플릿 빌더] 버튼 클릭 후 API Gateway 연동 탭 메뉴에서 [연동] 버튼 클릭
clovaocr-domain_04_230530_ko
Document: [API Gateway 연동] 버튼 클릭
clovaocr-domain_05_ko
Invoke URL 호출에 필요한 Secret Key를 발급하기 위해 [생성] 버튼을 클릭해 주십시오.
[복사] 버튼: 클릭 시 Secret Key값 복사
[확인] 버튼을 클릭해 주십시오.
APIGW 자동 연동의 [자동 연동] 버튼을 클릭해 주십시오.
[확인] 버튼을 클릭해 주십시오.
Invoke URL을 사용하기 위해 APIGW Invoke URL에서 [주소 복사] 버튼을 클릭해 주십시오.
clovaocr-domain_09_ko
참고
1.에서 Document의 인식 모델이 신분증인 경우, 신분증 및 여권(Global)을 인식하기 위한 Invoke URL을 각각 제공합니다.
6.에서 APIGW 자동 연동의 [수정하기] 버튼을 클릭하여 Invoke URL을 다시 생성할 수 있습니다. 다시 생성 시 CLOVA OCR 연결이 잠시 중단될 수 있습니다.

수동 연동
수동 연동은 도메인의 OCR Invoke URL과 API Gateway Endpoint 연결을 사용자가 직접 설정할 수 있습니다. 수동 연동 방법은 다음과 같습니다.

도메인을 생성한 후 수동 연동 설정 화면으로 이동해 주십시오.
General: [API Gateway 연동] 버튼 클릭 후 API Gateway 수동 연동 클릭
clovaocr-domain_06_230530_ko
Template: [템플릿 빌더] 버튼 클릭 후 API Gateway 연동 탭 메뉴에서 [연동] 버튼을 클릭한 다음 API Gateway 수동 연동 클릭
clovaocr-domain_07_230530_ko
Document: [API Gateway 연동] 버튼 클릭 후 API Gateway 수동 연동 클릭
clovaocr-domain_08_ko
수동 연동에 필요한 두 가지 정보를 준비해 주십시오.
CLOVA OCR Invoke URL: [주소 복사] 버튼을 클릭하여 복사
API Gateway 설정 정보: APIGW Configulation에서 [다운로드] 버튼 클릭
네이버 클라우드 플랫폼 콘솔의 Services > Application Services > API Gateway 메뉴를 차례대로 클릭해 주십시오.
My Products 메뉴를 클릭하여 Product를 생성해 주십시오.
생성한 Product의 APIs를 클릭하여 API를 생성해 주십시오.
생성 방법: Swagger에서 가져오기를 클릭하여 선택
업로드할 json 파일: 2.에서 다운로드한 파일
[Stage] 탭 메뉴에서 Stage API를 생성해 주십시오.
Endpoint 도메인: 2.에서 복사한 CLOVA OCR Invoke URL 값을 입력
OCR 빌더에 연동하려면 생성한 Stage의 Invoke URL을 복사하여 보관
생성한 API를 배포하기 위해 [Resource] 탭 메뉴에서 [API 배포] 버튼을 클릭해 주십시오.
Invoke URL을 사용하기 위해 [Stage] 탭 메뉴에서 [주소 복사] 버튼을 클릭해 주십시오.


{
  "swagger" : "2.0",
  "info" : {
    "description" : "",
    "version" : "2020-09-17T10:00:59Z",
    "title" : "external"
  },
  "host" : "",
  "basePath" : "",
  "schemes" : [ "https" ],
  "security" : [ {
    "x-ncp-apigw-api-key" : [ ]
  } ],
  "paths" : {
    "/" : { },
    "/{path+}" : {
      "post" : {
        "tags" : [ "aa" ],
        "description" : "The path is the API path",
        "consumes" : [ "application/json" ],
        "produces" : [ "application/json" ],
        "parameters" : [ {
          "name" : "path+",
          "in" : "path",
          "description" : "path",
          "required" : true,
          "type" : "string",
          "x-ncp-apigw-extended-variables" : true
        }, {
          "in" : "body",
          "name" : "requestBody",
          "description" : "custom api spec request body",
          "required" : true,
          "schema" : { }
        }, {
          "name" : "X-OCR-SECRET",
          "in" : "header",
          "description" : "The custom secret key",
          "required" : true,
          "type" : "string",
          "x-ncp-parameter-is-logged" : false
        } ],
        "responses" : {
          "200" : {
            "description" : "success"
          },
          "400" : {
            "description" : "request invalid"
          },
          "500" : {
            "description" : "service error"
          }
        },
        "x-ncp-apigw-use-body-when-formdata" : false,
        "x-ncp-apigateway-filters" : {
          "valid" : {
            "type" : "NONE"
          },
          "apiKey" : {
            "required" : false
          },
          "auth" : {
            "platform" : "NONE"
          }
        },
        "x-ncp-apigateway-endpoint" : {
          "HTTP" : {
            "stream" : true,
            "method" : "POST",
            "url" : "/{path}"
          }
        }
      }
    }
  },
  "securityDefinitions" : {
    "x-ncp-apigw-api-key" : {
      "type" : "apiKey",
      "name" : "x-ncp-apigw-api-key",
      "in" : "header"
    }
  },
  "definitions" : {
    "empty" : { }
  }
}
