"""
서버 상태 확인(Health Check) 라우트
서버 프리워밍(Pre-warming)을 위한 가벼운 엔드포인트
"""
from flask import Blueprint, jsonify

health_bp = Blueprint('health_bp', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    서버 상태 확인을 위한 엔드포인트
    서버가 실행 중인지 확인하고, 콜드 스타트 문제를 해결하기 위해 사용
    """
    return jsonify({"status": "awake", "message": "Server is running"}), 200