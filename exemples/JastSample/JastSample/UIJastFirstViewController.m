//
//  UIJastFirstViewController.m
//  JastSample
//
//  Created by adelskott on 23/03/13.
//  Copyright (c) 2013 adelskott. All rights reserved.
//

#import "UIJastFirstViewController.h"
#import "SocketIOPacket.h"
#import "SocketIOJSONSerialization.h"
#import "UIJastDetailViewController.h"

@interface UIJastFirstViewController ()

@end

@implementation UIJastFirstViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        self.title = NSLocalizedString(@"First", @"First");
        self.tabBarItem.image = [UIImage imageNamed:@"first"];
    }
    return self;
}
							
- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
    run = YES;
    [self socketconnect];   
}
-(void)refreshbt{
    NSString *title = (run) ? @"Stop" : @"Start";
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:title style:(UIBarButtonItemStyleBordered) target:self action:@selector(killresume)];
}
-(void)killresume{
    if(socketIO){
        
        [socketIO disconnect];
//        socketIO = nil;
        run = NO;
        self.navigationItem.rightBarButtonItem = nil;
    }else{
        run = YES;
        [self socketconnect];
    }

}
-(void)socketconnect{
    socketIO = [[SocketIO alloc] initWithDelegate:self];
    [socketIO connectToHost:@"localhost" onPort:80 withParams:nil withNamespace:@"/ns"];
    [self refreshbt];
}
- (void) socketIODidDisconnect:(SocketIO *)socket disconnectedWithError:(NSError *)error{
    if(run){
        [self performSelector:@selector(socketconnect) withObject:nil afterDelay:2];
    }else{
        socketIO.delegate = nil;
        socketIO = nil;
        [self refreshbt];
        
    }
}
- (void) socketIO:(SocketIO *)socket onError:(NSError *)error{
    [self performSelector:@selector(socketconnect) withObject:nil afterDelay:2];
}
- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void) socketIO:(SocketIO *)socket didReceiveEvent:(SocketIOPacket *)packet{
        NSLog(@"%@",packet.data);
    NSDictionary *d = [packet dataAsJSON];
    NSString *str = nil;
    if (d){
        NSArray *ar = d[@"args"];
        if ([ar count])
            str = ar[0];
    }

    NSData *utf8Data = [str dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [SocketIOJSONSerialization objectFromJSONData:utf8Data error:nil];

    [self renderdata:json];
    
    
}
/*- (void) socketIO:(SocketIO *)socket didSendMessage:(SocketIOPacket *)packet{
    
}*/
- (void) socketIODidConnect:(SocketIO *)socket{
    NSLog(@"Connected");
    NSDictionary *dict = @{@"client":@"1", @"key": @"1787db1a41077033b72e3ec9393db4b4baf04f50", @"app":@"2",@"channel":@"adelskott",@"url":@"http://search.twitter.com/search.json?q=sexy&rpp=5&include_entities=true&result_type=recent",@"ttl":@"3"};
    
   [socketIO sendEvent:@"psubscribe" withData:dict];
}


- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return [list count];
}


- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell){
        cell = [[UITableViewCell alloc] initWithStyle:(UITableViewCellStyleSubtitle) reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = list[indexPath.row][@"from_user_name"];
    cell.detailTextLabel.text = list[indexPath.row][@"text"];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    NSDictionary *e = list[indexPath.row];
    NSArray *elt = e[@"entities"][@"media"];
    if (!elt)
        elt = e[@"entities"][@"urls"];
    if (![elt count]){
        elt = e[@"entities"][@"user_mentions"];
        NSString *url = [NSString stringWithFormat:@"http://twitter.com/%@",e[@"from_user"]];
        if([elt count]){
            url = [NSString stringWithFormat:@"http://twitter.com/%@",elt[0][@"screen_name"]];
        }else{
            
        }
        if (url){
            UIJastDetailViewController *vc = [[UIJastDetailViewController alloc] initWithNibName:@"UIJastDetailViewController" bundle:nil];
            vc.url = url;
            [self.navigationController pushViewController:vc animated:YES];
            
        }
    
    }
    if ([elt count]){
        NSString *url = elt[0][@"expanded_url"];
        if (url){
            UIJastDetailViewController *vc = [[UIJastDetailViewController alloc] initWithNibName:@"UIJastDetailViewController" bundle:nil];
            vc.url = url;
            [self.navigationController pushViewController:vc animated:YES];

        }
    }
}


-(int)searchid:(NSNumber*)ide inData:(NSArray*)data{
    
    int i = 0;
    for (; i < [data count]; i++) {
        NSNumber *e = data[i][@"id"];
        
        if ([e isEqualToNumber:ide])
            return i;
    }
    return -1;
}

-(void)renderdata:(NSDictionary*)json{
    NSArray *ar = json[@"results"];

    
    NSMutableArray *updates = [[NSMutableArray alloc] init];
    NSMutableArray *reloads = [[NSMutableArray alloc] init];
    NSMutableArray *inserts = [[NSMutableArray alloc] init];
    NSMutableArray *dels = [[NSMutableArray alloc] init];

    NSMutableDictionary *ids = [[NSMutableDictionary alloc] init];
    
    int i = 0;
    for (NSDictionary *e in ar) {
        NSNumber *theid = e[@"id"];
        ids[theid] = @"";
        int idx = [self searchid:theid inData:list];
        if (idx >= 0 ){
            // update
            NSIndexPath *index2 = [NSIndexPath indexPathForItem:i inSection:0];
            NSIndexPath *index1 = [NSIndexPath indexPathForItem:idx inSection:0];
            if (idx != i)
                [updates addObject:@{@"a": index1,@"b":index2}];
            else
                [reloads addObject:index2];
        }else{
            // insert
            NSIndexPath *index = [NSIndexPath indexPathForItem:i inSection:0];
            [inserts addObject:index];
        }
        i++;
    }
    NSMutableArray *tempar = [[NSMutableArray alloc] init];
    i = 0;
    for (NSDictionary *e in list) {
        NSNumber *theid = e[@"id"];
        if (!ids[theid]){
            NSIndexPath *index = [NSIndexPath indexPathForItem:i inSection:0];
            [dels addObject:index];
        }else{
            [tempar addObject:e];
        }
        i++;
    }
    list = tempar;
    
    if([dels count] == [inserts count]){
        list = ar;
        [tb_view reloadData];
        return;
    }
    if ([dels count]){
        [tb_view beginUpdates];
        
        [tb_view deleteRowsAtIndexPaths:dels withRowAnimation:(UITableViewRowAnimationAutomatic)];
        [tb_view endUpdates];
    }
    list = ar;
    if ([inserts count]){
        [tb_view beginUpdates];
        [tb_view insertRowsAtIndexPaths:inserts withRowAnimation:(UITableViewRowAnimationAutomatic)];
        [tb_view endUpdates];
    }
    if ([updates count]){
        [tb_view beginUpdates];
        for (NSDictionary *e in updates)
            [tb_view moveRowAtIndexPath:e[@"a"] toIndexPath:e[@"b"]];
        [tb_view endUpdates];
    }
    if([reloads count]){
        [tb_view beginUpdates];
        [tb_view reloadRowsAtIndexPaths:reloads withRowAnimation:(UITableViewRowAnimationAutomatic)];
        [tb_view endUpdates];
    }
}


- (void)dealloc
{
    socketIO.delegate = nil;
    socketIO = nil;

}
@end
