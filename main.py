import pyautogui
import time
import random

PAUSE_BETWEEN_ACTION = 0.5 # in sec

QUEUEING_BUILDING_POSITION = (654, 676)
CANCEL_BUILDING_COLOR = (217, 15, 15)
WHITE_COLOR = (237, 239, 234)

TO_RESOURCES_POSITION = (678, 107)
TO_RESOURCES_COLOR = (206, 157, 70)

UPGRADE_VALIDATION_POSITION = (666, 228)
UPGRADE_VALIDATION_COLOR = (190, 172, 148)

RESOURCES_VALIDATION_POSITION = (1071, 667)
RESOURCES_VALIDATION_COLOR = (62, 76, 27)

RESOURCES_TO_BUILDINGS_POSITION = (852, 433)
RESOURCES_TO_BUILDINGS_COLOR = (201, 187, 155)

BUILDINGS_VALIDATION_POSITION = (1079, 673)
BUILDINGS_VALIDATION_COLOR = (184, 161, 136)

MAIN_BUILDING_POSITION = (798, 430)
MAIN_BUILDING_COLOR = (56, 73, 118)

WAREHOUSE_POSITION = (1182, 498)
WAREHOUSE_COLOR = (57, 81, 134)

ACADEMY_POSITION = (918, 649)
ACADEMY_COLOR = (98, 98, 115)

BARRACKS_POSITION = (888, 556)
BARRACKS_COLOR = (213, 196, 152)

WOOD_CUTTER_1_POSITION = (754, 324)
WOOD_CUTTER_1_COLOR = (116, 125, 78)
WOOD_CUTTER_2_POSITION = (911, 342)
WOOD_CUTTER_2_COLOR = (105, 113, 73)
WOOD_CUTTER_3_POSITION = (856, 502)
WOOD_CUTTER_3_COLOR = (99, 109, 61)
WOOD_CUTTER_4_POSITION = (838, 561)
WOOD_CUTTER_4_COLOR = (99, 109, 61)
WOOD_CUTTER_UPGRADE_POSITION = (761, 698)
WOOD_CUTTER_UPGRADE_COLOR = (164, 200, 106)
WOOD_CUTTER_UPGRADABLE_COLOR = (105, 148, 35)

CLAY_1_POSITION = (813, 376)
CLAY_1_COLOR = (153, 125, 102)
CLAY_2_POSITION = (874, 394)
CLAY_2_COLOR = (169, 133, 106)
CLAY_3_POSITION = (749, 542)
CLAY_3_COLOR = (145, 118, 97)
CLAY_4_POSITION = (932, 535)
CLAY_4_COLOR = (153, 117, 97)
CLAY_UPGRADE_POSITION = (754, 680)
CLAY_UPGRADE_COLOR = (173, 205, 121)
CLAY_UPGRADABLE_COLOR = (108, 152, 36)

# UPGRADE_POSITION = (809, 705)
# UPGRADE_COLOR = (145, 188, 75)
# UPGRADABLE_COLOR = (93, 132, 32)


def random_pause_between_actions():
    time.sleep(random.randint(5, 10))

def wait_for_queueing_build_finish():
    while validate_position(QUEUEING_BUILDING_POSITION, CANCEL_BUILDING_COLOR):
        print("Queuing building...")
        random_pause_between_actions()



def move_and_click(position, color):
    pyautogui.moveTo(position[0], position[1])
    time.sleep(PAUSE_BETWEEN_ACTION)

    # if validate_position(pyautogui.position(), color):
    print("Execute CLICK")
    pyautogui.click()

def validate_position(position, color):
    px = pyautogui.pixel(position[0], position[1])
    if px == color:
        # print("Color validation match")
        return True
    else:
        print("Not match", position)
        print(color)
        print(px)
        return False

def is_upgradable(upgrade_position, upgrade_color):
    return validate_position(UPGRADE_VALIDATION_POSITION, UPGRADE_VALIDATION_COLOR) and validate_position(upgrade_position, upgrade_color)

def is_at_resources_page():
    return validate_position(RESOURCES_VALIDATION_POSITION, RESOURCES_VALIDATION_COLOR)

def is_at_buildings_page():
    return validate_position(BUILDINGS_VALIDATION_POSITION, BUILDINGS_VALIDATION_COLOR)
    

def upgrade_resource_till_success(position, color, upgrade_position, upgrade_color):
    while not upgrade_resource(position, color, upgrade_position, upgrade_color):
        random_pause_between_actions()

def upgrade_resource(position, color, upgrade_position, upgrade_color):
    wait_for_queueing_build_finish()
    print("[UPGRADE RESOURCE] Queue finished")
    if is_at_resources_page():
        print("[UPGRADE RESOURCE] Is at resources page")
        move_and_click(position, color)
        random_pause_between_actions()
        if is_upgradable(upgrade_position, upgrade_color):
            print("[UPGRADE RESOURCE] Is upgradable")
            move_and_click(upgrade_position, upgrade_color)
            random_pause_between_actions()
            print("[UPGRADE RESOURCE] Upgraded")
            return True
        else:
            print("[UPGRADE RESOURCE] Not upgradable, wait again...")
            move_and_click(TO_RESOURCES_POSITION, TO_RESOURCES_COLOR)
            random_pause_between_actions()
            return False
    else:
        print("[UPGRADE RESOURCE] Not at resources page, return...")
        move_and_click(TO_RESOURCES_POSITION, TO_RESOURCES_COLOR)
        random_pause_between_actions()
    return False


upgrade_resource_till_success(WOOD_CUTTER_4_POSITION, WOOD_CUTTER_4_COLOR, WOOD_CUTTER_UPGRADE_POSITION, WOOD_CUTTER_UPGRADABLE_COLOR)
upgrade_resource_till_success(CLAY_4_POSITION, CLAY_4_COLOR, CLAY_UPGRADE_POSITION, CLAY_UPGRADABLE_COLOR)
upgrade_resource_till_success(WOOD_CUTTER_1_POSITION, WOOD_CUTTER_1_COLOR, WOOD_CUTTER_UPGRADE_POSITION, WOOD_CUTTER_UPGRADABLE_COLOR)
upgrade_resource_till_success(CLAY_1_POSITION, CLAY_1_COLOR, CLAY_UPGRADE_POSITION, CLAY_UPGRADABLE_COLOR)
upgrade_resource_till_success(WOOD_CUTTER_2_POSITION, WOOD_CUTTER_2_COLOR, WOOD_CUTTER_UPGRADE_POSITION, WOOD_CUTTER_UPGRADABLE_COLOR)
upgrade_resource_till_success(CLAY_2_POSITION, CLAY_2_COLOR, CLAY_UPGRADE_POSITION, CLAY_UPGRADABLE_COLOR)
upgrade_resource_till_success(WOOD_CUTTER_3_POSITION, WOOD_CUTTER_3_COLOR, WOOD_CUTTER_UPGRADE_POSITION, WOOD_CUTTER_UPGRADABLE_COLOR)
upgrade_resource_till_success(CLAY_3_POSITION, CLAY_3_COLOR, CLAY_UPGRADE_POSITION, CLAY_UPGRADABLE_COLOR)
upgrade_resource_till_success(WOOD_CUTTER_4_POSITION, WOOD_CUTTER_4_COLOR, WOOD_CUTTER_UPGRADE_POSITION, WOOD_CUTTER_UPGRADABLE_COLOR)
upgrade_resource_till_success(CLAY_4_POSITION, CLAY_4_COLOR, CLAY_UPGRADE_POSITION, CLAY_UPGRADABLE_COLOR)

# while True:
#     x, y = pyautogui.position()
#     px = pyautogui.pixel(CLAY_UPGRADE_POSITION[0], CLAY_UPGRADE_POSITION[1])
#     print(f"Position: [{x}, {y}]")
#     print(f"Color: {px}")
#     time.sleep(5)
