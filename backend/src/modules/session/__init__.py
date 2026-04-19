# Rebuild models after all imports are resolved
def _rebuild():
    from src.modules.session.schema import SessionResponse, SessionListResponseModel
    from src.modules.exercise.schema import ExerciseResponse
    SessionResponse.model_rebuild()
    SessionListResponseModel.model_rebuild()

_rebuild()