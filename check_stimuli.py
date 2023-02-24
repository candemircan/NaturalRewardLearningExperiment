# this is to check whether all the stimuli that the condition files call for exist
if __name__ == "__main__":

    import os
    import pandas as pd

    
    missing_file_list = []
    missing_stimuli = []
    cond_files = os.listdir('condition_files')
    for cond_file in cond_files:
        if cond_file.endswith('.json'):
            df_cond_file = pd.read_json(os.path.join('condition_files',cond_file))
            for arm in ['arm_0_image','arm_1_image']:
                if not all(df_cond_file[arm].apply(os.path.exists)):
                    missing_file_list.append(cond_file)
                    for item in df_cond_file[arm]:
                        if not os.path.exists(item):
                            missing_stimuli.append(item)
    
    if len(missing_file_list) == 0:
        print('all stimuli in condition files exist!')
    else:
        print(f'({set(missing_file_list)} contain missing stimuli')
        print(f'({set(missing_stimuli)} are the missing stimuli')
