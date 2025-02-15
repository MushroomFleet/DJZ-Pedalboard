NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

try:
    from .DJZ_Pedalboard import DJZ_Pedalboard
    NODE_CLASS_MAPPINGS["DJZ_Pedalboard"] = DJZ_Pedalboard
    NODE_DISPLAY_NAME_MAPPINGS["DJZ_Pedalboard"] = "DJZ_Pedalboard"
except ImportError:
    print("Unable to import DJZ_Pedalboard. This node will not be available.")

__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS']
