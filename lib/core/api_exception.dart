class ApiException implements Exception {
  ApiException(this.message, {this.status = 0});

  final String message;
  final int status;

  @override
  String toString() => message;
}
